import mongoose from 'mongoose';
import { IUser } from '../interfaces/user.interface';


const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add pre-save middleware, password hashing, etc.
UserSchema.pre('save', async function(next) {
  // Hash password before saving
  // Implement password hashing logic
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);