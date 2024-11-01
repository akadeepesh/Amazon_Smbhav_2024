import { Document } from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
}