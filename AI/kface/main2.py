import numpy as np
import argparse
import tensorflow as tf
import cv2
import dlib
from imutils import face_utils
from networks.models import ArcFaceModel
from utils import get_embeddings

# YOLO 모델 불러오기
from ultralytics import YOLO

# def compare_faces(detector, predictor, recognition_model, id_image_path, new_image_path):
def compare_faces(detector, recognition_model, id_image_path, new_image_path):
    # 신분증 이미지와 새로운 이미지 불러오기
    id_image = cv2.imread(id_image_path)
    new_image = cv2.imread(new_image_path)

    # 얼굴 감지 및 임베딩 추출 함수 정의
    def detect_and_get_embedding(image):
        # face_rects = detector(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), 1)
        # if len(face_rects) == 0:
        #     print("얼굴을 찾을 수 없습니다.")
        #     return None, None

        # for rect in face_rects:
        #     landmarks = predictor(image, rect)
        #     landmarks_np = face_utils.shape_to_np(landmarks)
        #     (x, y, w, h) = (rect.left(), rect.top(), rect.width(), rect.height())
        #     cropped_face = image[y:y+h, x:x+w]
        #     face_embedding = get_embeddings(recognition_model, cropped_face)
        #     return face_embedding, (x, y, w, h)

        detections = detector(image)[0]
        for data in detections.boxes.data.tolist():
            confidence = data[4]
            if confidence < 0.6:  # YOLO 감지 최소 신뢰도 설정
                continue
            # 감지된 얼굴의 좌표
            xmin, ymin, xmax, ymax = map(int, data[:4])
            cropped_face = image[ymin:ymax, xmin:xmax]
            face_embedding = get_embeddings(recognition_model, cropped_face)
            return face_embedding, (xmin, ymin, xmax - xmin, ymax - ymin)
        print("얼굴을 찾을 수 없습니다.")
        return None, None
    
    # 신분증 및 새로운 이미지에서 얼굴 임베딩 추출
    id_embedding, id_bbox = detect_and_get_embedding(id_image)
    new_embedding, new_bbox = detect_and_get_embedding(new_image)
    if id_embedding is None or new_embedding is None:
        print("임베딩을 추출할 수 없습니다.")
        return

    # 임베딩 간 거리 계산 및 바운딩 박스 색상 결정
    distance = np.linalg.norm(id_embedding - new_embedding)
    print(f"임베딩 거리: {distance:.4f}")

    # if distance < 1.0:  # 임계값(거리 기준)을 1.0으로 설정
    #     color = (0, 255, 0)  # 초록색: 일치
    # else:
    #     color = (0, 0, 255)  # 빨간색: 불일치

    # # 신분증 이미지와 새로운 이미지에 바운딩 박스 그리기
    # cv2.rectangle(id_image, (id_bbox[0], id_bbox[1]), (id_bbox[0] + id_bbox[2], id_bbox[1] + id_bbox[3]), color, 2)
    # cv2.rectangle(new_image, (new_bbox[0], new_bbox[1]), (new_bbox[0] + new_bbox[2], new_bbox[1] + new_bbox[3]), color, 2)

    color = (0, 255, 0) if distance < 1.0 else (0, 0, 255)  # 임계값에 따라 색상 설정

    # 신분증 이미지와 새로운 이미지에 바운딩 박스 그리기
    cv2.rectangle(id_image, (id_bbox[0], id_bbox[1]), (id_bbox[0] + id_bbox[2], id_bbox[1] + id_bbox[3]), color, 2)
    cv2.rectangle(new_image, (new_bbox[0], new_bbox[1]), (new_bbox[0] + new_bbox[2], new_bbox[1] + new_bbox[3]), color, 2)

    # 결과 출력
    cv2.imshow("ID Image", id_image)
    cv2.imshow("New Image", new_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", type=str)
    args = parser.parse_args()

    # 얼굴 감지 및 예측기 설정
    # detector = dlib.get_frontal_face_detector()
    # predictor = dlib.shape_predictor("weights/shape_predictor_68_face_landmarks.dat")

    # YOLO 얼굴 감지 모델 설정
    detector = YOLO('./weights/face-detection.pt')

    # ArcFace 모델 로드
    arcface = ArcFaceModel(size=112, backbone_type='ResNet50', training=False)
    # ckpt_path = tf.train.latest_checkpoint(args.weights)
    # arcface.load_weights(ckpt_path)
    arcface.load_weights("./weights/e_41_b_0.ckpt")

    # 비교할 이미지 경로 설정
    id_image_path = "./img/yook1.jpg"
    new_image_path = "./img/btob.jpg"

    # 얼굴 비교
    compare_faces(detector, arcface, id_image_path, new_image_path)
