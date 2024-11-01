import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AuthRequest } from '../types/request.types';

import { catchAsync } from '../utils/catch-async';
import { AppError } from '../utils/error-handler';
import { config } from '../config';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(400, 'User already exists');
  }

  const user = await User.create({
    email,
    password,
    name,
  });

  const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: config.jwtAccessTokenExpiresIn,
  });

  res.status(201).json({
    status: 'success',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
    expiresIn: config.jwtAccessTokenExpiresIn,
  });

  res.json({
    status: 'success',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    },
  });
});

export const getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  res.json({
    status: 'success',
    data: {
      user: {
        id: req.user?._id,
        email: req.user?.email,
        name: req.user?.name,
      },
    },
  });
});
