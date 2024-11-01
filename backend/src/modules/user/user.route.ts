import { Router } from 'express';
import { UserController } from './user.controller';
;

class UserRoutes {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/create', 
      
      this.userController.createUser
    );
    this.router.post(
      '/login', 
      this.userController.login
    );
    

    this.router.get(
      '/:email', 
      this.userController.getUserByEmail
    );
  }
}

export const userRoutes = new UserRoutes().router;
