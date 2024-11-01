from imutils import face_utils 
import matplotlib.pyplot as plt 
import numpy as np 
import argparse 
import imutils
import dlib 
import cv2 
import face_recognition 
 
known_face_encodings = [] 
known_face_names = []


def plt_imshow(title='image', img=None, figsize=(8 ,5)):
    plt.figure(figsize=figsize)
 
    if type(img) == list:
        if type(title) == list:
            titles = title
        else:
            titles = []
 
            for i in range(len(img)):
                titles.append(title)
 
        for i in range(len(img)):
            if len(img[i].shape) <= 2:
                rgbImg = cv2.cvtColor(img[i], cv2.COLOR_GRAY2RGB)
            else:
                rgbImg = cv2.cvtColor(img[i], cv2.COLOR_BGR2RGB)
 
            plt.subplot(1, len(img), i + 1), plt.imshow(rgbImg)
            plt.title(titles[i])
            plt.xticks([]), plt.yticks([])
 
        plt.show()
    else:
        if len(img.shape) < 3:
            rgbImg = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        else:
            rgbImg = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
 
        plt.imshow(rgbImg)
        plt.title(title)
        plt.xticks([]), plt.yticks([])
        plt.show()


# 얼굴을 찾아 인코딩 후 비교하고 출력하는 Function
# 이미지에서 얼굴을 찾고 찾은 영역의 얼굴을 인코딩
# 이렇게 찾은 얼굴의 인코딩 값을 반복적으로 수행하면서 
# 찾으려고 등록했던 known_face_encodings 리스트와 비교
def name_labeling(input_image):
    image = input_image.copy()
    face_locations = face_recognition.face_locations(image)
    face_encodings = face_recognition.face_encodings(image, face_locations)
    
    face_names = []
 
    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
        name = "Unknown"
 
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        best_match_index = np.argmin(face_distances)
 
        if matches[best_match_index]:
            name = known_face_names[best_match_index]
 
        face_names.append(name)
        
    for (top, right, bottom, left), name in zip(face_locations, face_names):
        if name != "Unknown":
            color = (0, 255, 0)
        else:
            color = (0, 0, 255)
 
        cv2.rectangle(image, (left, top), (right, bottom), color, 1)
        cv2.rectangle(image, (left, bottom - 10), (right, bottom), color, cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(image, name, (left + 3, bottom - 3), font, 0.2, (0, 0, 0), 1)
        
    plt_imshow("Output", image, figsize=(24, 15))


# 찾은 얼굴을 등록하는 함수
def draw_label(input_image, coordinates, label):
    image = input_image.copy()
    (top, right, bottom, left) = coordinates
    cv2.rectangle(image, (left, top), (right, bottom), (0, 255, 0), 5)
    cv2.putText(image, label, (left - 10, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3)
    
    return image
    
def add_known_face(face_image_path, name):
    face_image = cv2.imread(face_image_path)
    face_location = face_recognition.face_locations(face_image)[0]
    face_encoding = face_recognition.face_encodings(face_image)[0]
    
    detected_face_image = draw_label(face_image, face_location, name)
    
    known_face_encodings.append(face_encoding)
    known_face_names.append(name)
    
    plt_imshow(["Input Image", "Detected Face"], [face_image, detected_face_image])


# 이미지 경로와 이름을 입력하면 얼굴 인코딩 값을 리스트에 추가
add_known_face("../data/yook2.jpg", "Yook") 
add_known_face("../data/son2.jpg", "sonny")


# 테스트
test_image_path = 'img/players.jpg'
test_image = cv2.imread(test_image_path)
 
if test_image is None:
    print('The image does not exist in the path.')
else:
    print('image loading complete.')

name_labeling(test_image)