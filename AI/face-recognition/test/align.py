import dlib
import cv2

# pre-trained 얼굴 랜드마크 모델 경로
predictor_model = "../model/shape_predictor_68_face_landmarks.dat"

# 이미지 파일 경로
file_name = '../data/yook2.jpg'

# dlib의 HOG 기반 얼굴 감지기와 랜드마크 예측기 불러오기
face_detector = dlib.get_frontal_face_detector()
face_pose_predictor = dlib.shape_predictor(predictor_model)

# 이미지 로드
image = cv2.imread(file_name)

# HOG 얼굴 감지 실행
detected_faces = face_detector(image, 1)

print("Found {} faces in the image file {}".format(len(detected_faces), file_name))

# 얼굴 정렬 함수
def align_face(image, face_rect, pose_landmarks):
    # 눈 좌표 계산
    left_eye = pose_landmarks.part(36)
    right_eye = pose_landmarks.part(45)

    # 두 눈 사이 중심 좌표 계산
    eye_center = ((left_eye.x + right_eye.x) // 2, (left_eye.y + right_eye.y) // 2)

    # 두 눈 사이 거리 계산 및 회전 각도 계산
    dx = right_eye.x - left_eye.x
    dy = right_eye.y - left_eye.y
    angle = cv2.fastAtan2(dy, dx)

    # 회전 행렬 계산
    rot_matrix = cv2.getRotationMatrix2D(eye_center, angle, 1.0)

    # 얼굴 이미지 회전
    aligned_image = cv2.warpAffine(image, rot_matrix, (image.shape[1], image.shape[0]))

    return aligned_image

# 감지된 얼굴 반복 처리
for i, face_rect in enumerate(detected_faces):

    # 감지된 얼굴 영역 좌표 출력
    print("- Face #{} found at Left: {} Top: {} Right: {} Bottom: {}".format(
        i, face_rect.left(), face_rect.top(), face_rect.right(), face_rect.bottom()))

    # 얼굴 랜드마크 감지
    pose_landmarks = face_pose_predictor(image, face_rect)

    # 얼굴 정렬
    alignedFace = align_face(image, face_rect, pose_landmarks)

    # 정렬된 얼굴 저장
    aligned_filename = f"aligned_face_{i}.jpg"
    cv2.imwrite(aligned_filename, alignedFace)
    print(f"Aligned face saved as {aligned_filename}")

    # 정렬된 얼굴을 창으로 출력
    cv2.imshow(f"Aligned Face {i}", alignedFace)

# 모든 창이 닫힐 때까지 대기
print("Press ESC to close the windows.")
while True:
    if cv2.waitKey(1) & 0xFF == 27:  # ESC 키로 종료
        break

# 모든 창 닫기
cv2.destroyAllWindows()
