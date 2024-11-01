import express from 'express';
import cors from 'cors';
import { userRoutes } from './modules/user/user.route';
// import { userRoutes } from './modules/user/user.route';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({
    success: false,
    message: err.message,
  });
});

export default app;