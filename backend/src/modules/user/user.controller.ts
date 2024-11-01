import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public createUser = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const userData = req.body;
      const result = await this.userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  public login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;
  
      const result = await this.userService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  public getUserByEmail = async (
    req: Request, 
    res: Response, 
    next: NextFunction
  ) => {
    try {
      const { email } = req.params;
      const user = await this.userService.getUserByEmail(email);
      
      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}