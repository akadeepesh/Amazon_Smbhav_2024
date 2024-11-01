import mongoose from 'mongoose';
// import { logger } from '../utils/logger.util';

class Database {
  private static instance: Database;
  
  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri, {
        // MongoDB connection options
        autoIndex: true,
      });
    //   logger.info('Successfully connected to MongoDB');
    } catch (error) {
    //   logger.error('MongoDB connection error:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
    //   logger.info('MongoDB disconnected');
    } catch (error) {
    //   logger.error('MongoDB disconnection error:', error);
    }
  }
}

export const database = Database.getInstance();