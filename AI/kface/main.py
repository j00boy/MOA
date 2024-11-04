import numpy as np
import argparse
import tensorflow as tf
import cv2
from networks.models import ArcFaceModel
from utils import get_embeddings

# YOLO 모델 불러오기
from ultralytics import YOLO

def compare_faces(detector, recognition_model, id_image_path, new_image_path):
    # 등록 이미지 불러오기 및 얼굴 임베딩 추출
    id_image = cv2.imread(id_image_path)
    id_embedding, id_bbox = detect_and_get_embedding(detector, recognition_model, id_image)
    
    if id_embedding is None:
        print("ID 사진에서 얼굴을 찾을 수 없습니다.")
        return
    
    # 새로운 이미지 불러오기
    new_image = cv2.imread(new_image_path)

    # 새로운 이미지에서 얼굴 감지 및 비교
    results = detector(new_image)[0]
    for data in results.boxes.data.tolist():
        confidence = data[4]
        if confidence < 0.6:
            continue
        
        xmin, ymin, xmax, ymax = map(int, data[:4])
        cropped_face = new_image[ymin:ymax, xmin:xmax]
        new_embedding = get_embeddings(recognition_model, cropped_face)
        
        if new_embedding is None:
            print("얼굴 임베딩을 추출할 수 없습니다.")
            continue
        
        # 임베딩 거리 계산
        distance = np.linalg.norm(id_embedding - new_embedding)
        print(f"임베딩 거리: {distance:.4f}")
        
        # 거리 임계값을 기준으로 색상 설정
        color = (0, 255, 0) if distance < 1.0 else (0, 0, 255)
        
        # 바운딩 박스 그리기
        cv2.rectangle(new_image, (xmin, ymin), (xmax, ymax), color, 2)
        label = "Matched" if distance < 1.0 else "Not Matched"
        cv2.putText(new_image, label, (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # 결과 출력
    cv2.imshow("ID Image", id_image)
    cv2.imshow("New Image", new_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def detect_and_get_embedding(detector, recognition_model, image):
    """ 얼굴을 감지하고 임베딩을 추출하는 함수 """
    results = detector(image)[0]
    for data in results.boxes.data.tolist():
        confidence = data[4]
        if confidence < 0.6:  # YOLO 감지 최소 신뢰도 설정
            continue
        xmin, ymin, xmax, ymax = map(int, data[:4])
        cropped_face = image[ymin:ymax, xmin:xmax]
        face_embedding = get_embeddings(recognition_model, cropped_face)
        return face_embedding, (xmin, ymin, xmax - xmin, ymax - ymin)
    return None, None

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", type=str)
    args = parser.parse_args()

    # YOLO 얼굴 감지 모델 설정
    yolo_detector = YOLO('./weights/face-detection.pt')

    # ArcFace 모델 로드
    arcface = ArcFaceModel(size=112, backbone_type='ResNet50', training=False)
    arcface.load_weights("./weights/e_41_b_0.ckpt")

    # 비교할 이미지 경로 설정
    id_image_path = "./img/yook5.jpg"
    new_image_path = "./img/btob.jpg"

    # 얼굴 비교
    compare_faces(yolo_detector, arcface, id_image_path, new_image_path)



# import numpy as np
# import tensorflow as tf
# import cv2
# from networks.models import ArcFaceModel
# from utils import get_embeddings

# # YOLO 모델 불러오기
# from ultralytics import YOLO

# def compare_faces(detector, recognition_model, id_image_path, new_image_path):
#     # 신분증 이미지 불러오기 및 얼굴 임베딩 추출
#     id_image = cv2.imread(id_image_path)
#     id_embedding, id_bbox = detect_and_get_embedding(detector, recognition_model, id_image)
    
#     if id_embedding is None:
#         print("ID 사진에서 얼굴을 찾을 수 없습니다.")
#         return
    
#     # 새로운 이미지 불러오기
#     new_image = cv2.imread(new_image_path)

#     # 최소 거리와 해당 바운딩 박스 정보를 저장할 변수 초기화
#     min_distance = float("inf")
#     best_bbox = None
#     best_label = "Not Matched"

#     # 새로운 이미지에서 얼굴 감지 및 비교
#     results = detector(new_image)[0]
#     for data in results.boxes.data.tolist():
#         confidence = data[4]
#         if confidence < 0.6:
#             continue
        
#         xmin, ymin, xmax, ymax = map(int, data[:4])
#         cropped_face = new_image[ymin:ymax, xmin:xmax]
#         new_embedding = get_embeddings(recognition_model, cropped_face)
        
#         if new_embedding is None:
#             print("얼굴 임베딩을 추출할 수 없습니다.")
#             continue
        
#         # 임베딩 거리 계산
#         distance = np.linalg.norm(id_embedding - new_embedding)
#         print(f"임베딩 거리: {distance:.4f}")
        
#         # 최저 거리와 해당 바운딩 박스를 저장
#         if distance < min_distance:
#             min_distance = distance
#             best_bbox = (xmin, ymin, xmax, ymax)
#             best_label = "Matched" if distance < 1.0 else "Not Matched"

#     # 최저 거리의 얼굴 바운딩 박스를 그리기
#     if best_bbox:
#         color = (0, 255, 0) if best_label == "Matched" else (0, 0, 255)
#         cv2.rectangle(new_image, (best_bbox[0], best_bbox[1]), (best_bbox[2], best_bbox[3]), color, 2)
#         cv2.putText(new_image, best_label, (best_bbox[0], best_bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

#     # 결과 출력
#     cv2.imshow("ID Image", id_image)
#     cv2.imshow("New Image", new_image)
#     cv2.waitKey(0)
#     cv2.destroyAllWindows()

# def detect_and_get_embedding(detector, recognition_model, image):
#     """ 얼굴을 감지하고 임베딩을 추출하는 함수 """
#     results = detector(image)[0]
#     for data in results.boxes.data.tolist():
#         confidence = data[4]
#         if confidence < 0.6:  # YOLO 감지 최소 신뢰도 설정
#             continue
#         xmin, ymin, xmax, ymax = map(int, data[:4])
#         cropped_face = image[ymin:ymax, xmin:xmax]
#         face_embedding = get_embeddings(recognition_model, cropped_face)
#         return face_embedding, (xmin, ymin, xmax - xmin, ymax - ymin)
#     return None, None

# if __name__ == "__main__":
#     # YOLO 얼굴 감지 모델 설정
#     yolo_detector = YOLO('./weights/face-detection.pt')

#     # ArcFace 모델 로드
#     arcface = ArcFaceModel(size=112, backbone_type='ResNet50', training=False)
#     arcface.load_weights("./weights/e_41_b_0.ckpt")

#     # 비교할 이미지 경로 설정
#     id_image_path = "./img/yook5.jpg"
#     new_image_path = "./img/btob.jpg"

#     # 얼굴 비교
#     compare_faces(yolo_detector, arcface, id_image_path, new_image_path)
