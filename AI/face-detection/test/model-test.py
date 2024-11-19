# fps 계산을 위해 datetime을 import하고 OpenCV와 YOLO를 차례로 import
import datetime
import cv2
from ultralytics import YOLO

# 최소 정확도, 녹색과 흰색 정의
CONFIDENCE_THRESHOLD = 0.6
GREEN = (0, 255, 0)
WHITE = (255, 255, 255)

# 사용할 YOLOv8 모델을 설정한다. 
model = YOLO('../model/face-detection.pt')

# 테스트할 이미지 경로 설정 (여기에 테스트할 이미지 경로를 입력하세요)
image_path = './img/test2.jpg'

# 시작 시간 기록
start = datetime.datetime.now()

# 이미지 불러오기
frame = cv2.imread(image_path)
if frame is None:
    print("이미지를 불러올 수 없습니다.")
    exit()

# 모델을 사용해 이미지에서 객체 탐지 수행
detection = model(frame)[0]

# [xmin, ymin, xmax, ymax, confidence, class_id] 정보 추출 및 시각화
for data in detection.boxes.data.tolist():
    confidence = float(data[4])
    if confidence < CONFIDENCE_THRESHOLD:
        continue

    xmin, ymin, xmax, ymax = int(data[0]), int(data[1]), int(data[2]), int(data[3])
    label = int(data[5])
    
    # 사각형 및 텍스트 그리기
    cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), GREEN, 2)
    # cv2.putText(frame, f'Conf: {round(confidence, 2)}%', 
    #             (xmin, ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, WHITE, 1)

# 종료 시간 기록 및 처리 시간 계산
end = datetime.datetime.now()
total_time = (end - start).total_seconds()

# 처리 시간 및 FPS 출력
print(f'Time to process the image: {total_time * 1000:.0f} milliseconds')
print(f'FPS: {1 / total_time:.2f}')

# 창 크기 설정 및 이미지 크기 조정
# frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)  # 이미지 크기 50% 축소
cv2.namedWindow('Processed Image', cv2.WINDOW_NORMAL)
cv2.resizeWindow('Processed Image', 640, 480)  # 창 크기 설정

# 처리된 이미지 화면에 출력
cv2.imshow('Processed Image', frame)

# ESC 키 입력 시 종료
while True:
    if cv2.waitKey(1) & 0xFF == 27:
        break

cv2.destroyAllWindows()
