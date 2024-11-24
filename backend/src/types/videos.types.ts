import mongoose from 'mongoose';

export interface IVideoDocument  {
  title: string;
  url: string;
  type: 'file' | 'link';
  description?: string;
  owner: string;  
  uploadedAt: Date;
}