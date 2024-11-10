import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from '../utils/error-handler';
import { config } from '../config';

export class AuthService {
  private generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.jwtAccessTokenExpiresIn,
    });
  }

  private formatUserResponse(user: any) {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
    };
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }

    const user = await User.create({
      email,
      password,
      name,
    });

    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: this.formatUserResponse(user),
    };
  }

  async login(email: string, password: string) {
    // Changed from findOne({ email }) to explicitly query by email field
    const user = await User.findOne({ email: email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = this.generateToken(user._id.toString());

    return {
      token,
      user: this.formatUserResponse(user),
    };
  }

  async getProfile(userId: string) {
    // Use findById for querying by _id
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      user: this.formatUserResponse(user),
    };
  }
}