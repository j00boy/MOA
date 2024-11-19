"""
TensorFlow를 사용하여 TFRecord 데이터셋을 로드하고 전처리하는 함수들을 정의
"""

import tensorflow as tf

# TFRecord 파일을 읽고 이미지 및 레이블 추출
def _parse_tfrecord(binary_img=False, is_ccrop=False):
    def parse_tfrecord(tfrecord):
        # binary_img 옵션에 따라 이미지 데이터를 다르게 처리
        if binary_img:
            features = {'image/source_id': tf.io.FixedLenFeature([], tf.int64),
                        'image/filename': tf.io.FixedLenFeature([], tf.string),
                        'image/encoded': tf.io.FixedLenFeature([], tf.string)}
            x = tf.io.parse_single_example(tfrecord, features)
            x_train = tf.image.decode_jpeg(x['image/encoded'], channels=3)
        else:
            features = {'image/source_id': tf.io.FixedLenFeature([], tf.int64),
                        'image/img_path': tf.io.FixedLenFeature([], tf.string)}
            x = tf.io.parse_single_example(tfrecord, features)
            image_encoded = tf.io.read_file(x['image/img_path'])
            x_train = tf.image.decode_jpeg(image_encoded, channels=3)
        
        # 레이블 데이터를 추출하고 전처리 적용
        y_train = tf.cast(x['image/source_id'], tf.float32)

        x_train = _transform_images(is_ccrop=is_ccrop)(x_train)
        y_train = _transform_targets(y_train)
        return (x_train, y_train), y_train
    return parse_tfrecord


# 이미지 전처리
def _transform_images(is_ccrop=False):
    def transform_images(x_train):
        x_train = tf.image.resize(x_train, (128, 128)) # 이미지 크기 조정
        x_train = tf.image.random_crop(x_train, (112, 112, 3)) # 이미지 무작위 자르기
        x_train = tf.image.random_flip_left_right(x_train) # 좌우 반전
        x_train = tf.image.random_saturation(x_train, 0.6, 1.4) # 채도 조정
        x_train = tf.image.random_brightness(x_train, 0.4) # 밝기 조정
        x_train = x_train / 255 # 0~1 사이 값으로 정규화
        return x_train
    return transform_images


def _transform_targets(y_train):
    return y_train


# TFRecord 데이터셋 로드 및 배치 처리
def load_tfrecord_dataset(tfrecord_name, batch_size, binary_img=False, shuffle=True,
                            buffer_size=10240, is_ccrop=False):
    # load dataset from tfrecord
    raw_dataset = tf.data.TFRecordDataset(tfrecord_name)
    raw_dataset = raw_dataset.repeat()  # 데이터 반복
    if shuffle:
        raw_dataset = raw.dataset.shuffle(buffer_size=buffer_size)
    dataset = raw_dataset.map(
        _parse_tfrecord(binary_img=binary_img, is_ccrop=is_ccrop),
        num_parallel_calls=tf.data.experimental.AUTOTUNE)
    dataset = dataset.batch(batch_size) # 배치로 묶기
    dataset = dataset.prefetch(
        buffer_size=tf.data.experimental.AUTOTUNE)  # 데이터 로딩 성능 최적화
    return dataset


# 가짜 데이터셋 생성
def load_fake_dataset(size):
    # load fake dataset
    x_train = tf.image.decode_jpeg(
        open('./yook2.jpg', 'rb').read(), channels=3)
    x_train = tf.expand_dims(x_train, axis=0)
    x_train = tf.image.resize(x_train, (size, size))

    labels = [0]
    y_train = tf.convert_to_tensor(labels, tf.float32)
    y_train = tf.expand_dims(y_train, axis=0)

    # 데이터셋 형식으로 변환
    return tf.data.Dataset.from_tensor_slices((x_train, y_train))
