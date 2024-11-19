from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from pydantic import BaseModel
from fastapi import APIRouter
from typing import List
import requests  # requests 라이브러리 추가
import logging
import face_recognition
import numpy as np
import cv2
import io
import os
import boto3
import base64
import time
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

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

# 요청 데이터 모델 정의
class FaceCompareRequest(BaseModel):
    group_id: int
    moment_ids: List[str]
    reference_embedding: str

@router.post("")
async def compare_face(request: FaceCompareRequest):

    group_id = request.group_id
    moment_ids = request.moment_ids
    reference_embedding = request.reference_embedding

    # base64 디코딩
    reference_embedding_bytes = base64.b64decode(reference_embedding)

    # numpy 배열로 변환 (float64 형식)
    reference_embedding_array = np.frombuffer(reference_embedding_bytes, dtype=np.float64)

    matching_urls = []

    def process_file(file_key):
        file_url = f"https://{bucket_name}.s3.ap-northeast-2.amazonaws.com/{file_key}"
        try:
            # S3에서 이미지 다운로드
            s3_object = s3.get_object(Bucket=bucket_name, Key=file_key)
            image_data = s3_object['Body'].read()

            # OpenCV로 이미지 디코딩 및 얼굴 임베딩 추출
            np_img = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
            height, width = image.shape[:2]
            new_width = 640
            new_height = int((new_width / width) * height)
            resized_image = cv2.resize(image, (new_width, new_height))
            face_locations = face_recognition.face_locations(resized_image)
            face_encodings = face_recognition.face_encodings(resized_image, face_locations)

            # 얼굴 비교
            for encoding in face_encodings:
                match = face_recognition.compare_faces([reference_embedding_array], encoding, tolerance=0.45)
                if match[0]:
                    print("일치")
                    return file_url  # 일치하는 URL 반환
                print("불일치")
        except Exception as e:
            print(f"Error processing file {file_key}: {e}")
        return None

    try:
        for moment_id in moment_ids:
            prefix = f"group/{group_id}/moment/{moment_id}/"
            print(prefix)
            try:
                response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
                print("response 성공")
            except Exception as e:
                print("Error occurred:", e)

            # for obj in response.get('Contents', []):
            #     file_key
            file_keys = [obj['Key'] for obj in response.get('Contents', []) if obj['Size'] > 0]

            # 병렬 처리 시작
            start_time_all = time.time()  # 전체 처리 시작 시간
            with ThreadPoolExecutor(max_workers=4) as executor:
                results = executor.map(process_file, file_keys)

            for result in results:
                if result:  # None이 아닌 URL만 추가
                    matching_urls.append(result)
            print(f"Total processing time {time.time() - start_time_all:.2f} seconds")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Spring으로 비교 결과 반환
    return {"matchingUrls": matching_urls}