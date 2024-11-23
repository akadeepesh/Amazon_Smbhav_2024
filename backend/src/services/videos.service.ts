import { AppError } from '../utils/error-handler';
import { User } from '../models/user.model';
import { Video } from '../models/videos.model';

export class VideoService {
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async addVideo(user: any, videoData: {
    title: string;
    url: string;
    type: string;
    description?: string;
  }) {
    const { title, url, type, description } = videoData;
    console.log(videoData);

    if (!title || !url || !type) {
      throw new AppError(400, 'Title, URL, and type are required');
    }

    if (!this.isValidUrl(url)) {
      throw new AppError(400, 'Invalid URL format');
    }

    if (!['file', 'link'].includes(type)) {
      throw new AppError(400, 'Invalid video type. Must be either "file" or "link"');
    }

    const video = await Video.create({
      title,
      url,
      type,
      description,
      owner: user._id
    });

    return video;
  }

  getUserVideos(user: any, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const videos = user.videos
      .sort((a: any, b: any) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(skip, skip + limit);

    const total = user.videos.length;

    return {
      videos,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }

  getVideo(user: any, videoId: string) {
    const video = user.videos.id(videoId);
    if (!video) {
      throw new AppError(404, 'Video not found');
    }
    return video;
  }

  async updateVideo(user: any, videoId: string, updateData: {
    title?: string;
    url?: string;
    description?: string;
  }) {
    const video = user.videos.id(videoId);
    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    const { title, url, description } = updateData;

    if (url && !this.isValidUrl(url)) {
      throw new AppError(400, 'Invalid URL format');
    }

    if (title) video.title = title;
    if (url) video.url = url;
    if (description !== undefined) video.description = description;

    await user.save();
    return video;
  }

  async deleteVideo(user: any, videoId: string) {
    const videoIndex = user.videos.findIndex(
      (video: any) => video._id.toString() === videoId
    );

    if (videoIndex === -1) {
      throw new AppError(404, 'Video not found');
    }

    user.videos.splice(videoIndex, 1);
    await user.save();
  }
}