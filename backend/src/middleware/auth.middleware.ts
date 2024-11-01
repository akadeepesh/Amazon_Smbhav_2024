// src/middleware/auth.middleware.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/request.types';
import { User } from '../models/user.model';

import { AppError } from '../utils/error-handler';


import { catchAsync } from '../utils/catch-async';
import { config } from '../config';

// Types for JWT payload
interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const authMiddleware = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 1) Check if token exists in headers
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Access Denied');
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTimestamp) {
      throw new AppError(401, 'Access Denied');
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new AppError(401, 'User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Access Denied');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Access Denied');
    }
    throw error;
  }
});



export const isAuthenticated = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    req.user = user || undefined;
  } catch (error) {
    req.user = undefined;
  }

  next();
});

export const refreshToken = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(401, 'Access Denied.');
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new AppError(401, 'User no longer exists');
    }

    const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: config.jwtAccessTokenExpiresIn,
    });

    res.json({
      status: 'success',
      data: {
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Access Denied.');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Access Denied.');
    }
    throw error;
  }
});


