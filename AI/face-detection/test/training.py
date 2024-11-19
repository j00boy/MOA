from ultralytics import YOLO
import os

os.environ["CUDA_VISIBLE_DEVICES"]="8" # 주피터허브 gpu 디바이스 번호 지정

if __name__ == "__main__":
    model = YOLO('yolov8n.pt')
    model.train(data='widerface.yaml', epochs=100, imgsz=640)