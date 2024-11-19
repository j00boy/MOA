from fastapi import FastAPI, UploadFile, File, HTTPException, Response
# from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi import APIRouter
import requests  # requests 라이브러리 추가
import logging
import face_recognition
import numpy as np
import cv2
import io
import os
import base64


router = APIRouter()

# 기본 설정
ROOT = os.path.dirname(__file__)
logging.basicConfig(level=logging.INFO)
pcs = set()

class ImageRequest(BaseModel):
    image_url: str

"""
# 얼굴 이미지 업로드를 통해 임베딩 값을 추출하고 등록하는 엔드포인트
# 백에서 S3에 저장된 이미지 URL 받아와서 다운 후 임베딩 값 추출
# opencv 라이브러리 활용
# 추출된 임베딩 값을 다시 백으로 전달
"""
# @app.post("/fast/register_face/")
@router.post("")
async def register_face(request: ImageRequest):

    image_url = request.image_url
    print(f"Fetching image from URL: {image_url}")

    # 이미지 URL에서 이미지 다운로드
    response = requests.get(image_url)
    if response.status_code != 200:
        print(f"Failed to fetch image URL: {image_url}")
        raise HTTPException(status_code=400, detail="Image not found")

    # 이미지 파일을 읽고 OpenCV 형식으로 변환
    np_img = np.frombuffer(response.content, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    try:
        face_locations = face_recognition.face_locations(image)
        if not face_locations:
            raise ValueError("얼굴을 찾을 수 없습니다.")
        # 얼굴 인코딩(임베딩) 추출
        face_embedding = face_recognition.face_encodings(image, face_locations)[0]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    print(face_embedding)
    # 바이트로 변환 후 Base64 인코딩
    embedding_bytes = face_embedding.tobytes()

    encoded_embedding = base64.b64encode(embedding_bytes).decode('utf-8')
    print(encoded_embedding)

    # base64 데이터 반환
    print("Returning face embedding as base64.")
    return Response(content=encoded_embedding)