"""
softmax 손실함수 정의
모델이 예측한 결과(y_pred)와 실제 정답(y_true) 간의 차이를 계산하여 손실값을 구합니다.
모델이 예측한 클래스와 실제 클래스의 불일치를 측정하기 위해 사용
"""

import tensorflow as tf

def SoftmaxLoss():
    def softmax_loss(y_true, y_pred):
        # y_true: sparse target
        # y_pred: logist
        y_true = tf.cast(tf.reshape(y_true, [-1]), tf.int32)
        ce = tf.nn.sparse_softmax_cross_entropy_with_logits(labels=y_true, logits=y_pred)
        return tf.reduce_mean(ce)
    return softmax_loss
