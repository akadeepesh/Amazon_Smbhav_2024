import { Request, Response } from 'express';

import { catchAsync } from '../utils/catch-async';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const result = await authService.register(email, password, name);

  res.status(201).json({
    status: 'success',
    data: result
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.json({
    status: 'success',
    data: result
  });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = authService.getProfile(req.body.userId);

  res.json({
    status: 'success',
    data: result
  });
});