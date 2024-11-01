import { Response } from 'express';

export class ApiResponse {
  public static ok(res: Response, message: string, data?: any) {
    return res.status(200).json({
      success: true,
      message,
      data
    });
  }

  public static created(res: Response, message: string, data?: any) {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  public static error(res: Response, message: string, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message
    });
  }
}
