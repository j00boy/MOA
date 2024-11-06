import cv2
import torch
import numpy as np
from ultralytics import YOLO
# from facenet_pytorch import InceptionResnetV1
from tensorflow.keras.models import load_model

# FaceNet으로 얼굴 임베딩 추출
def get_face_embedding(facenet_model, face_image):
    face_image = cv2.resize(face_image, (160, 160))  # FaceNet 입력 크기에 맞게 조정
    face_image = face_image.astype('float32')
    mean, std = face_image.mean(), face_image.std()
    if std == 0:    # 표준편차가 0인 경우 예외 처리
        std = 1e-6
    face_image = (face_image - mean) / std
    face_image = np.expand_dims(face_image, axis=0)
    embedding = facenet_model.predict(face_image)
    return embedding[0]


# 얼굴 비교 함수 (코사인 유사도)
# def compare_faces(embedding1, embedding2, threshold=0.4):
#     cos_sim = torch.nn.functional.cosine_similarity(embedding1, embedding2)
#     return cos_sim.item() > threshold

# 얼굴 임베딩을 비교하는 함수 (L2 거리 사용)
def is_match(known_embedding, candidate_embedding, threshold=8):  # 임계값 조정 가능
    distance = np.linalg.norm(known_embedding - candidate_embedding)
    return distance < threshold


# 이미지 파일로 얼굴 감지 및 비교 처리
def process_image(yolo_model, facenet_model, registered_embeddings, registered_names, image_path):
    image = cv2.imread(image_path)  # 이미지를 불러옴

    # YOLO 모델로 얼굴 감지
    detection = yolo_model(image)[0]

    for face_box_data in detection.boxes.data.tolist():
        xmin, ymin, xmax, ymax, confidence = map(int, face_box_data[:5])
        face_image = image[ymin:ymax, xmin:xmax]

        # FaceNet으로 얼굴 임베딩 추출
        face_embedding = get_face_embedding(facenet_model, face_image)

        # 등록된 얼굴과 비교
        match_found = False
        matched_name = ""
        for reg_emb, reg_name in zip(registered_embeddings, registered_names):
            if is_match(face_embedding, reg_emb):
                match_found = True
                matched_name = reg_name
                break

        # 등록된 얼굴이면 초록색, 등록되지 않은 얼굴이면 빨간색으로 바운딩 박스와 이름 표시
        if match_found:
            color = (0, 255, 0)
            label = matched_name
        else:
            color = (0, 0, 255)
            label = "Unknown"
        
        # 바운딩 박스와 이름 표시
        cv2.rectangle(image, (xmin, ymin), (xmax, ymax), color, 2)
        cv2.putText(image, label, (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # 이미지 크기 조정 (원래 이미지의 절반 크기로 표시)
    resized_image = cv2.resize(image, (image.shape[1] // 2, image.shape[0] // 2))

    # 결과 이미지 출력
    cv2.imshow('Face Detection', resized_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# YOLO와 FaceNet 모델 초기화
yolo_model = YOLO('../model/face-detection.pt')  # YOLO 모델 초기화
# facenet_model = InceptionResnetV1(pretrained='vggface2').eval()
facenet_model = load_model('../model/facenet_keras.h5')

# 등록된 얼굴의 임베딩 리스트와 이름 (사전에 FaceNet으로 계산된 임베딩)
registered_faces = ['../img/yl2.jpg']
registered_names = ['yelim']  # 등록된 얼굴에 대한 이름 리스트

# 등록된 얼굴들의 임베딩을 리스트로 저장
registered_embeddings = []
for face_path in registered_faces:
    face_image = cv2.imread(face_path)
    face_embedding = get_face_embedding(facenet_model, face_image)
    registered_embeddings.append(face_embedding)

# 이미지 파일로 얼굴 감지 및 비교
process_image(yolo_model, facenet_model, registered_embeddings, registered_names, '../img/yl3.jpg')
34