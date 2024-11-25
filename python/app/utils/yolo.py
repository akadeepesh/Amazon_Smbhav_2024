# from ultralytics import YOLO

class YOLOv8Detector:
    """
    Singleton class for YOLOv8 model initialization.
    """
    _model = None

    @staticmethod
    def get_model():
        if YOLOv8Detector._model is None:
            pass
            # YOLOv8Detector._model = YOLO("yolov8n.pt")  # Use the Nano model for speed
        return YOLOv8Detector._model
