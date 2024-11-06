import datetime
import cv2
import numpy as np
import dlib
from tensorflow.keras.models import load_model
from ultralytics import YOLO

# FaceNet 모델 로드
facenet_model = load_model('../model/facenet_keras.h5')

# YOLO 모델 설정
model = YOLO('../model/face-detection.pt')

# dlib의 얼굴 랜드마크 예측기 로드
predictor = dlib.shape_predictor('../model/shape_predictor_68_face_landmarks.dat')

# 등록된 얼굴 임베딩과 이름을 저장하는 리스트 초기화
known_face_embeddings = []
known_face_names = []

# 얼굴 정렬 함수
def align_face(image, rect):
    shape = predictor(image, rect)
    landmarks = np.array([[shape.part(i).x, shape.part(i).y] for i in range(68)])
    left_eye_center = landmarks[36:42].mean(axis=0).astype("int")
    right_eye_center = landmarks[42:48].mean(axis=0).astype("int")
    delta_x = right_eye_center[0] - left_eye_center[0]
    delta_y = right_eye_center[1] - left_eye_center[1]
    angle = np.degrees(np.arctan2(delta_y, delta_x))
    eyes_center = (int((left_eye_center[0] + right_eye_center[0]) // 2),
                   int((left_eye_center[1] + right_eye_center[1]) // 2))
    M = cv2.getRotationMatrix2D(eyes_center, angle, 1)
    (h, w) = image.shape[:2]
    aligned_face = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC)
    return aligned_face

# 얼굴 임베딩(벡터)을 추출하는 함수
def get_face_embedding(model, face_pixels):
    face_pixels = cv2.resize(face_pixels, (160, 160))
    face_pixels = face_pixels.astype('float32')
    mean, std = face_pixels.mean(), face_pixels.std()
    if std == 0:
        std = 1e-6
    face_pixels = (face_pixels - mean) / std
    face_pixels = np.expand_dims(face_pixels, axis=0)
    embedding = model.predict(face_pixels)
    return embedding[0]

# 얼굴 임베딩을 비교하는 함수 (L2 거리 사용)
def is_match(known_embedding, candidate_embedding, threshold=5):
    distance = np.linalg.norm(known_embedding - candidate_embedding)
    # return distance < threshold
    return distance

# 얼굴 등록 함수
def register_face(face_image, name):
    face_embedding = get_face_embedding(facenet_model, face_image)
    known_face_embeddings.append(face_embedding)
    known_face_names.append(name)
    print(f'{name} 등록 완료')

# 등록할 얼굴 이미지 파일로부터 등록
image = cv2.imread('../img/yook2.jpg')
register_face(image, 'ysj')

# 비교할 두 이미지 불러오기
test_image = cv2.imread('../img/btob.jpg')

# 얼굴 감지 및 비교
def compare_faces_in_image(yolo_model, facenet_model, test_image):
    detection = yolo_model(test_image)[0]

    for data in detection.boxes.data.tolist():
        xmin, ymin, xmax, ymax, confidence = int(data[0]), int(data[1]), int(data[2]), int(data[3]), data[4]
        rect = dlib.rectangle(xmin, ymin, xmax, ymax)

        # YOLO로 감지된 얼굴에 대해 dlib으로 얼굴 정렬
        aligned_face = align_face(test_image, rect)
        face_embedding = get_face_embedding(facenet_model, aligned_face)
        
        # 등록된 얼굴과 비교
        match_found = False
        name = "Unknown"
        for i, known_embedding in enumerate(known_face_embeddings):
            distance = is_match(known_embedding, face_embedding)
            print("임베딩값 = ", distance)
            if (distance < 5) :
                match_found = True
                name = known_face_names[i]
                break
                

        # 등록된 얼굴에는 초록색, 등록되지 않은 얼굴에는 빨간색 바운딩 박스와 이름 표시
        color = (0, 255, 0) if match_found else (0, 0, 255)
        label = name if match_found else "Unknown"
        cv2.rectangle(test_image, (xmin, ymin), (xmax, ymax), color, 2)
        cv2.putText(test_image, label, (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # 이미지 크기 조정 (원래 이미지의 절반 크기로 표시)
    # resized_image = cv2.resize(test_image, (test_image.shape[1] // 2, test_image.shape[0] // 2))

    # 결과 이미지 출력
    cv2.imshow('Face Comparison', test_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# 비교 수행
compare_faces_in_image(model, facenet_model, test_image)
