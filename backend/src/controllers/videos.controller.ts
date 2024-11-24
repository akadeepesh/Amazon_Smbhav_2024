import { Response } from "express";
import { AuthRequest } from "../types/request.types";
import { catchAsync } from "../utils/catch-async";
import { AppError } from "../utils/error-handler";
import { VideoService } from "../services/videos.service";

const videoService = new VideoService();

export const addVideo = catchAsync(async (req: AuthRequest, res: Response) => {
  // console.log(req.user);
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }
  console.log(req.user);

  const video = await videoService.addVideo(req.user, req.body);

  res.status(201).json({
    status: "success",
    data: { video },
  });
});

export const getUserVideos = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = videoService.getUserVideos(req.user, page, limit);

    res.json({
      status: "success",
      data: result,
    });
  }
);

export const getVideo = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }

  const video = videoService.getVideo(req.user, req.params.videoId);

  res.json({
    status: "success",
    data: { video },
  });
});

export const updateVideo = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    const video = await videoService.updateVideo(
      req.user,
      req.params.videoId,
      req.body
    );

    res.json({
      status: "success",
      data: { video },
    });
  }
);

export const deleteVideo = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    await videoService.deleteVideo(req.user, req.params.videoId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);
