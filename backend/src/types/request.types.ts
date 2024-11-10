import { Request } from 'express';
import { IUserDocument } from './user.types';


export interface AuthRequest extends Request {
  user?: IUserDocument;
}