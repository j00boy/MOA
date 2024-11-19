import os
import cv2

# 경로 설정
image_dir = 'C:/Users/SSAFY/Desktop/AI/yolo/data/widerface/images/train'
annotation_file = '../../data/wider_face_split/wider_face_train_bbx_gt.txt'
output_label_dir = 'C:/Users/SSAFY/Desktop/AI/yolo/data/widerface/labels/train'

# 출력 폴더 생성
os.makedirs(output_label_dir, exist_ok=True)

# 바운딩 박스 좌표 정규화 함수
def normalize_bbox(x, y, w, h, img_width, img_height):
    x_center = (x + w / 2) / img_width
    y_center = (y + h / 2) / img_height
    width = w / img_width
    height = h / img_height
    return x_center, y_center, width, height

# 주석 파일 읽기 및 YOLO 형식으로 변환
with open(annotation_file, 'r') as f:
    lines = f.readlines()

idx = 0
while idx < len(lines):
    line = lines[idx].strip()
    
    # 이미지 경로인지 확인
    if line.endswith('.jpg'):
        image_path = line  # 이미지 경로 저장
        idx += 1
        
        # 얼굴 개수 가져오기
        face_count = int(lines[idx].strip())
        idx += 1

        # 이미지 경로 설정 및 이미지 크기 확인
        img_full_path = os.path.join(image_dir, image_path)
        img = cv2.imread(img_full_path)
        if img is None:
            print(f"이미지를 찾을 수 없습니다: {img_full_path}")
            continue
        img_height, img_width = img.shape[:2]

        # 라벨을 저장할 폴더 경로 생성 (이미지 경로 구조를 유지)
        label_subdir = os.path.join(output_label_dir, os.path.dirname(image_path))
        os.makedirs(label_subdir, exist_ok=True)  # 폴더가 없으면 생성

        # YOLO 형식의 라벨 파일 생성
        label_file = os.path.join(label_subdir, os.path.basename(image_path).replace('.jpg', '.txt'))
        with open(label_file, 'w') as label_f:
            for _ in range(face_count):
                # 좌표만 추출 (첫 4개의 값: x, y, width, height)
                bbox = list(map(int, lines[idx].strip().split()[:4]))
                idx += 1

                # YOLO 형식으로 변환
                x_center, y_center, width, height = normalize_bbox(bbox[0], bbox[1], bbox[2], bbox[3], img_width, img_height)

                # 라벨 파일에 저장 (class_id는 0으로 설정)
                label_f.write(f"0 {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}\n")
    else:
        idx += 1  # 이미지 경로가 아닌 경우 건너뜀

# 변환 완료 메시지 출력
print("라벨 파일 변환 완료 (폴더 별로 저장됨)")