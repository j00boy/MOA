from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi import APIRouter
from typing import List
import boto3
import cv2
import numpy as np
from ultralytics import YOLO
import base64
import time
import os
import logging
from dotenv import load_dotenv

# FastAPI 설정
router = APIRouter()

# 기본 설정
ROOT = os.path.dirname(__file__)
logging.basicConfig(level=logging.INFO)
pcs = set()

# .env 파일 로드
load_dotenv()

# AWS 자격 증명 환경 변수 가져오기
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")

# S3 클라이언트 설정
s3 = boto3.client(
    's3', region_name='ap-northeast-2', 
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key)
bucket_name = 'moa-s3-bucket'

boto3.set_stream_logger('boto3', level=logging.DEBUG)

# YOLO 모델 로드
model = YOLO('../model/food-detection.pt')

# YOLO 얼굴 검출 모델 로드
face_model = YOLO('../model/face-detection.pt')

# 최소 정확도 및 색상 정의
CONFIDENCE_THRESHOLD = 0.6

# 요청 데이터 모델 정의
class FoodDetectionRequest(BaseModel):
    group_id: int
    moment_ids: List[str]

@router.post("")
async def detect_food(request: FoodDetectionRequest):
    group_id = request.group_id
    moment_ids = request.moment_ids

    matching_urls = []

    try:
        # 각 moment_id에 대해 S3 경로 확인 및 처리
        for moment_id in moment_ids:
            prefix = f"group/{group_id}/moment/{moment_id}/thumbnail/"
            try:
                response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
                print("response 성공")
            except Exception as e:
                print("Error occurred:", e)

            for obj in response.get('Contents', []):
                file_key = obj['Key']
                if obj['Size'] == 0:
                    continue
                file_url = f"https://{bucket_name}.s3.ap-northeast-2.amazonaws.com/{file_key}"
                print(file_url)

                # S3에서 이미지 다운로드
                try:
                    s3_object = s3.get_object(Bucket=bucket_name, Key=file_key)
                    image_data = s3_object['Body'].read()
                except Exception as e:
                    print("Error occurred:", e)

                # OpenCV로 이미지 디코딩
                np_img = np.frombuffer(image_data, np.uint8)
                frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                # YOLO 모델로 음식 검출 수행
                detection = model(frame)[0]

                # YOLO 모델로 얼굴 검출 수행
                face_detection = face_model(frame)[0]

                # 검출된 객체 확인
                if not detection.boxes.data.tolist():
                    print("검출된 객체가 없습니다.")
                    continue
                else:
                    if face_detection.boxes.data.tolist():
                        print("얼굴 포함")
                    else:
                        print("음식사진이다!")
                        matching_urls.append(file_url)
                

                # detected = False
                # for data in detection.boxes.data.tolist():
                #     confidence = float(data[4])
                #     if confidence < CONFIDENCE_THRESHOLD:
                #         continue
                #     detected = True
                #     break

                # # 음식이 검출되었으면 URL 추가
                # if detected:
                #     matching_urls.append(file_url)
                #     print("검출")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 검출된 음식이 포함된 이미지 URL 리스트 반환
    return {"matchingUrls": matching_urls}