import bcrypt from 'bcrypt';
import { IUser } from '../../models/interfaces/user.interface';
import { User } from '../../models/schemas/user.schema';
import { generateToken } from '../../utils/jwt.util';
// import { generateToken } from '../utils/jwt.util';

export class UserService {
  private readonly SALT_ROUNDS = 10;

  public async createUser(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        throw new Error('User with this email or username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);
      
      const newUser = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      
      // Generate JWT token
      const token = generateToken({ 
        userId: savedUser._id,
        email: savedUser.email
      });

      return {
        user: {
          _id: savedUser._id,
          username: savedUser.username,
          email: savedUser.email
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  public async login(email: string, password: string) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }
     

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken({ 
        userId: user._id,
        email: user.email
      });

      return {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  public async getUserByEmail(email: string) {
    try {
      const user = await User.findOne({ email }).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}