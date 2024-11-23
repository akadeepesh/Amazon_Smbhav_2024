# app/utils/detector.py

import cv2
import torch
import numpy as np
from pathlib import Path
from typing import Optional, List, Tuple
from detectron2 import model_zoo
from detectron2.config import get_cfg
from detectron2.engine import DefaultPredictor
from detectron2.utils.visualizer import Visualizer
from detectron2.data import MetadataCatalog

class Detector:
    def __init__(self):
        self.cfg = self._setup_config()
        self.predictor = DefaultPredictor(self.cfg)
        
    def _setup_config(self):
        cfg = get_cfg()
        cfg.merge_from_file(model_zoo.get_config_file("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml"))
        cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5
        cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml")
        # Force CPU
        cfg.MODEL.DEVICE = "cpu"
        return cfg
    
    def process_image(self, image_path: str) -> Tuple[np.ndarray, List]:
        """Process a single image and return the annotated image and detections."""
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image at {image_path}")
            
        # Get predictions
        outputs = self.predictor(image)
        
        # Visualize predictions
        v = Visualizer(image[:, :, ::-1], 
                      MetadataCatalog.get(self.cfg.DATASETS.TRAIN[0]), 
                      scale=1.2)
        output_image = v.draw_instance_predictions(outputs["instances"].to("cpu"))
        output_image = output_image.get_image()[:, :, ::-1]
        
        # Extract detection results
        detections = {
            "classes": outputs["instances"].pred_classes.tolist(),
            "boxes": outputs["instances"].pred_boxes.tensor.tolist(),
            "scores": outputs["instances"].scores.tolist()
        }
        
        return output_image, detections
    
    def process_video(self, video_path: str, output_path: str, 
                     save_frames: bool = False) -> str:
        """Process a video file and return the path to the processed video."""
        # Open video capture
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video at {video_path}")
            
        # Get video properties
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, 
                            (frame_width, frame_height))
        
        frame_count = 0
        frames_dir = None
        
        if save_frames:
            frames_dir = Path(output_path).parent / "frames"
            frames_dir.mkdir(exist_ok=True)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # Get predictions
            outputs = self.predictor(frame)
            
            # Visualize predictions
            v = Visualizer(frame[:, :, ::-1], 
                          MetadataCatalog.get(self.cfg.DATASETS.TRAIN[0]), 
                          scale=1.2)
            output_frame = v.draw_instance_predictions(outputs["instances"].to("cpu"))
            output_frame = output_frame.get_image()[:, :, ::-1]
            
            # Save frame if requested
            if save_frames:
                frame_path = frames_dir / f"frame_{frame_count:04d}.jpg"
                cv2.imwrite(str(frame_path), output_frame)
            
            # Write frame to video
            out.write(output_frame)
            frame_count += 1
        
        # Release resources
        cap.release()
        out.release()
        
        return output_path