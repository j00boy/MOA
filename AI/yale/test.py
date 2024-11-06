import os
import cv2
import numpy as np
from PIL import Image
import dlib
from ultralytics import YOLO

# face_detector = dlib.get_frontal_face_detector()
face_detector = YOLO('./model/face-detection.pt')



# A predictor that detect faces based on 68 key features of faces
points_68_detector = dlib.shape_predictor('./model/shape_predictor_68_face_landmarks.dat')



train_image_path='./yalefaces'

all_train_image_file_name = os.listdir(train_image_path)

all_train_image_paths = [os.path.join(train_image_path, f) for f in all_train_image_file_name]


os.path.split(all_train_image_paths[0])


def fetch_preprocessed_image_data(image_paths):
    face_images = []
    ids_of_image = []

    for image_path in image_paths:
        image = Image.open(image_path).convert('L') # convert to grayscale
        image_np = np.array(image, 'uint8')  # convert the image type to a numpy array type (with integer format)
        image_file_name = os.path.split(image_path)[1]
        id_of_image = int(image_file_name.split('.')[0].replace('subject', ''))
        ids_of_image.append(id_of_image)
        face_images.append(image_np)

    return np.array(ids_of_image), face_images
     
ids_of_train_image, faces_of_train_image = fetch_preprocessed_image_data(all_train_image_paths)

ids_of_train_image

faces_of_train_image[0]
faces_of_train_image[0].shape

len(ids_of_train_image), len(faces_of_train_image)



image = cv2.imread('/content/drive/MyDrive/colab/Computer-Vision-Course/Data/Images/people.jpg')

# face_detections = face_detector(image, 1)
face_detections = face_detector(image)[0]

# for face_detection in face_detections:
#     face_points = points_68_detector(image, face_detection)
#     for face_point in face_points.parts():
#         cv2.circle(image, (face_point.x, face_point.y), 2, (0, 255, 255))
#         left, top, right, bottom = face_detection.left(), face_detection.top(), face_detection.right(), face_detection.bottom()
#         cv2.rectangle(image, (left, top), (right, bottom), (0, 255, 0), 2)

# YOLO 감지된 얼굴에서 각 얼굴의 랜드마크 포인트 그리기
for detection in yolo_detections.boxes.data.tolist():
    # YOLO 탐지 영역 좌표 추출
    xmin, ymin, xmax, ymax = map(int, detection[:4])

    # dlib의 rectangle 객체 생성 (랜드마크 감지에 사용)
    rect = dlib.rectangle(xmin, ymin, xmax, ymax)

    # 얼굴 랜드마크 감지
    face_points = points_68_detector(image, rect)
    
    # 랜드마크 포인트와 얼굴 바운딩 박스 그리기
    for face_point in face_points.parts():
        cv2.circle(image, (face_point.x, face_point.y), 2, (0, 255, 255), -1)
    cv2.rectangle(image, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)

cv2_imshow(image)