import mongoose from 'mongoose';
import { IVideoDocument } from '../types/videos.types';


const videoSchema = new mongoose.Schema<IVideoDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['file', 'link']
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type:String,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'videos'
});

// Index for faster queries
// videoSchema.index({ owner: 1, uploadedAt: -1 });

export const Video = mongoose.model<IVideoDocument>('Video', videoSchema);