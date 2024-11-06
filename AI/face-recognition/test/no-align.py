import datetime
import cv2
import numpy as np
import dlib
from tensorflow.keras.models import load_model
from ultralytics import YOLO

# FaceNet 모델 로드 (GPU 사용)
facenet_model = load_model('../model/facenet_keras.h5')

# YOLO 모델 설정 (더 가벼운 YOLO 모델 사용)
model = YOLO('../model/face-detection.pt')

# 등록된 얼굴 임베딩과 이름을 저장하는 리스트 초기화
known_face_embeddings = []
known_face_names = []

# 얼굴 임베딩(벡터)을 추출하는 함수
def get_face_embedding(model, face_pixels):
    face_pixels = cv2.resize(face_pixels, (160, 160))  # FaceNet 입력 크기로 맞춤
    face_pixels = face_pixels.astype('float32')
    mean, std = face_pixels.mean(), face_pixels.std()
    if std == 0:  # 표준편차가 0인 경우 예외 처리
        std = 1e-6
    face_pixels = (face_pixels - mean) / std
    face_pixels = np.expand_dims(face_pixels, axis=0)
    embedding = model.predict(face_pixels)
    return embedding[0]

# 얼굴 임베딩을 비교하는 함수 (L2 거리 사용)
def is_match(known_embedding, candidate_embedding, threshold=8):  # 임계값 조정 가능
    distance = np.linalg.norm(known_embedding - candidate_embedding)
    # return distance < threshold
    return distance

# 얼굴 등록 함수
def register_face(face_image, name):
    face_embedding = get_face_embedding(facenet_model, face_image)
    known_face_embeddings.append(face_embedding)
    known_face_names.append(name)
    print(f'{name} 등록 완료')
    # print("등록된 얼굴 임베딩 값 = ", face_embedding)

# 특정 얼굴 등록 (이미지를 파일에서 불러오는 경우)
image = cv2.imread('../img/yl2.jpg')
register_face(image, 'yelim')

# 비교할 이미지 파일 불러오기
target_image_path = '../img/yl4.jpg'
target_image = cv2.imread(target_image_path)

# YOLO로 얼굴 감지 및 처리
detection = model(target_image)[0]
for data in detection.boxes.data.tolist():
    xmin, ymin, xmax, ymax, confidence = int(data[0]), int(data[1]), int(data[2]), int(data[3]), data[4]
    if confidence < 0.6:  # 신뢰도 임계값 설정
        continue

    face_image = target_image[ymin:ymax, xmin:xmax]
    face_embedding = get_face_embedding(facenet_model, face_image)

    # 등록된 얼굴과 비교
    match_found = False
    matched_name = ""
    for i, known_embedding in enumerate(known_face_embeddings):
        distance = is_match(known_embedding, face_embedding)
        print("임베딩 거리 = ", distance)
        if (distance < 8.5):
            match_found = True
            matched_name = known_face_names[i]
            break

    # 등록된 얼굴이면 초록색, 등록되지 않은 얼굴이면 빨간색으로 바운딩 박스와 이름 표시
    if match_found:
        color = (0, 255, 0)
        label = matched_name
    else:
        color = (0, 0, 255)
        label = "Unknown"
    
    # 바운딩 박스와 이름 표시
    cv2.rectangle(target_image, (xmin, ymin), (xmax, ymax), color, 2)
    cv2.putText(target_image, label, (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

# 이미지 크기 조정 (원래 이미지의 절반 크기로 표시)
resized_image = cv2.resize(target_image, (target_image.shape[1] // 2, target_image.shape[0] // 2))

# 결과 이미지 출력
cv2.imshow('Face Detection', resized_image)
cv2.waitKey(0)
cv2.destroyAllWindows()
