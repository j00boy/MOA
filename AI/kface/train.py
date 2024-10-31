import tensorflow as tf

from networks.models import ArcFaceModel, ArcHead
from networks.losses import SoftmaxLoss
import data.load_arcface as dataset
from utils import load_yaml, get_ckpt_inf


# arc_res50_kface_finetune.yaml 파일의 설정을 불러와 모델 학습에 필요한 파라미터를 cfg에 저장
# ongoing=False 이므로 새로운 학습 시작
def main(ongoing=False):
    cfg = load_yaml("../configs/arc_res50_kface_finetune.yaml")

    # 사전 훈련된 모델 로드
    # 파인튜닝 시에는 설정 파일에 정의된 num_classes를 사용하고, 
    # 처음 학습 시에는 85,742개의 클래스(사람)를 사용
    num_classes = cfg['num_classes'] if ongoing else 85742

    # cfg 파일의 설정을 사용해 입력 크기, 백본 네트워크, 임베딩 크기, 가중치 감쇠(w_decay) 등을 설정
    model = ArcFaceModel(size=cfg['input_size'],
                        backbone_type=cfg['backbone_type'],
                        num_classes=num_classes,
                        head_type=cfg['head_type'],
                        embd_shape=cfg['embd_shape'],
                        w_decay=cfg['w_decay'],
                        training=True)
    # 모델 구조 출력
    model.summary(line_length=80)

    # 컴파일
    # 설정 파일의 기본 학습률을 tf.constant로 지정
    learning_rate = tf.constant(cfg['base_lr'])
    # SGD 옵티마이저를 사용하여 학습을 수행하며, 
    # 모멘텀과 Nesterov 가속 기법을 적용하여 학습 속도를 높임
    optimizer = tf.keras.optimizers.SGD(learning_rate=learning_rate, momentum=0.9, nesterov=True)
    # SoftmaxLoss() 함수로 모델의 출력값과 실제값 간의 손실을 계산
    loss_fn = SoftmaxLoss()


    model_name = cfg['sub_name'] + f"-lr{cfg['base_lr']}-bs{cfg['batch_size']}-trainable2"

    # 이어서 학습할지 여부에 따라 체크포인트 경로 설정 및 최신 체크포인트 불러오기
    # 이전 학습의 에포크와 스텝 정보를 get_ckpt_inf 함수를 통해 불러오기
    if ongoing:
        ckpt_path = tf.train.latest_checkpoint("weights/" + model_name)
        dataset_len = cfg['num_samples']
        steps_per_epoch = dataset_len // cfg['batch_size']
    else:
        # finetune scratch
        ckpt_path = tf.train.latest_checkpoint('weights/arc_res50_ccrop')
        dataset_len = cfg['num_samples']
        steps_per_epoch = dataset_len // cfg['batch_size']

    print("[*] load ckpt from {}".format(ckpt_path))
    model.load_weights(ckpt_path)
    epochs, steps = get_ckpt_inf(ckpt_path, steps_per_epoch)

    if not ongoing:
        epochs, steps = 1, 1
    

    # 새롭게 정의하는 모델
    n_label = tf.keras.layers.Input([])
    n_model = model.layers[1](model.layers[0].output)
    n_model = model.layers[2](n_model)
    """ 
    헤드 교체
    기존 ArcFace 모델의 헤드를 재정의하여 ArcHead를 사용하고, 
    학습을 위한 새로운 모델(n_model)을 생성
    """
    n_model = ArcHead(num_classes=cfg['num_classes'], margin=0.5, logist_scale=64.0)(n_model, n_label)
    n_model = tf.keras.Model(inputs=(model.input[0], n_label), outputs=n_model)
    model = n_model

    """
    모델 동결
    model.layers[:2]로 첫 두 레이어는 학습되지 않도록 동결하여 파인튜닝 시 기존의 특징을 유지
    """
    for layer in model.layers[:2]:
        layer.trainable = False
    # 모델의 수정된 구조 출력
    model.summary()

    
    # 데이터셋 로드
    # load_tfrecord_dataset 함수로 TFRecord 파일로 저장된 학습 데이터 불러오기
    train_dataset = dataset.load_tfrecord_dataset(cfg['train_dataset'],
                                                    cfg['batch_size'],
                                                    cfg['binary_img'],
                                                    is_ccrop=cfg['is_ccrop'])
    train_dataset = iter(train_dataset)
    summary_writer = tf.summary.create_file_writer("logs/" + model_name)

    # 학습 루프
    while epochs <= cfg['epochs']:
        inputs, labels = next(train_dataset) # train_dataset에서 배치 데이터 불러오기

        with tf.GradientTape() as tape:
            logits = model(inputs, training=True)
            # 정규화 손실(reg_loss): 모델 내의 정규화 손실을 합산
            reg_loss = tf.reduce_sum(model.losses)
            # 예측 손실(pred_loss): 모델 출력과 실제값의 차이를 SoftmaxLoss를 통해 계산
            pred_loss = loss_fn(labels, logits)
            # 총 손실(total_loss): 예측 손실과 정규화 손실을 합산
            total_loss = pred_loss + reg_loss

        # GradientTape로 미분하여 optimizer를 통해 모델의 가중치를 업데이트
        grads = tape.gradient(total_loss, model.trainable_variables)
        optimizer.apply_gradients(zip(grads, model.trainable_variables))


        # 매 save_steps마다 현재 학습 상태를 출력하고, 손실 및 학습률을 기록
        if steps % (cfg['save_steps'] // 10) == 0:
            verb_str = "Epoch {}/{}: {}/{}, loss={:.2f}, lr={:.4f}"
            print(verb_str.format(epochs, cfg['epochs'],
                                    steps % steps_per_epoch,
                                    steps_per_epoch,
                                    total_loss.numpy(),
                                    learning_rate.numpy()))
            
            with summary_writer.as_default():
                tf.summary.scalar('total loss', total_loss, step=steps)
                tf.summary.scalar('pred loss', pred_loss, step=steps)
                tf.summary.scalar('reg loss', reg_loss, step=steps)
                tf.summary.scalar('learning rate', optimizer.lr, step=steps)
        
        # save_steps마다 체크포인트를 저장하여 모델을 주기적으로 백업
        if steps % cfg['save_steps'] == 0:
            print(f"Saved checkpooint for step {int(steps)}")
            model.save_weights('checkpoints/' + model_name + f"/e_{epochs}_b_{steps % steps_per_epoch}.ckpt")

        steps += 1
        epochs = steps // steps_per_epoch + 1


if __name__ == "__main__":
    main(ongoing=False)