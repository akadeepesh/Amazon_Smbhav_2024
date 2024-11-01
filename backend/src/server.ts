// import app from './app';
// import { database } from './config/database';
import dotenv from 'dotenv';
import { database } from './config/database';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

const startServer = async () => {
  try {
    // Connect to database
    await database.connect(MONGODB_URI);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();