// videos.routes.ts
import express from 'express';

import {
  addVideo,
  getUserVideos,
  getVideo,
  updateVideo,
  deleteVideo
} from '../controllers/videos.controller';

import { authMiddleware } from '../middleware/auth.middleware';
import { validateVideo } from '../middleware/validation';



const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Video management routes
router.post('/',  addVideo);
// router.get('/', getUserVideos);
// router.get('/:videoId', getVideo);
// router.patch('/:videoId', updateVideo);
// router.delete('/:videoId', deleteVideo);

export const videoRoutes = router;