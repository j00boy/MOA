from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from apis.apis_base import api_router
from fastapi.staticfiles import StaticFiles
import os
import uvicorn
import traceback

# 모든 origin에서 발생하는 요청들 처리함
def include_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def include_router(app):
    app.include_router(api_router)

def start_application():
    app = FastAPI(title="MOA", version="1.0")
    include_cors(app)
    include_router(app)
    
    # 정적 파일 서빙
    root_directory = os.path.join(os.getcwd(), "static")  # 현재 작업 디렉토리에 있는 static 폴더
    app.mount("/static", StaticFiles(directory=root_directory), name="static")

    return app

app = start_application()

# 오류 발생 시 traceback 출력하는 미들웨어 추가
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        # traceback을 이용하여 상세 오류 로그 출력
        print("An error occurred:")
        print(traceback.format_exc())  # 전체 스택 트레이스 출력
        raise e

if __name__ == "__main__":
    uvicorn.run("main:app", port=8008, reload=True, ws_ping_interval=6000, ws_ping_timeout=600)