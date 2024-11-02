import express from 'express';
import mongoose from 'mongoose';

import { globalErrorHandler } from './utils/error-handler';
import { authRoutes } from './routes/auth.routes';
import { config } from './config';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(globalErrorHandler);

// MongoDB Connection
mongoose
  .connect(config.mongodbUri)
  .then(() => {
    console.log(`Connected to MongoDB`);
    // Start the server after successful DB connection
    const PORT = config.port || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));

export default app;