import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: 3000,
  mongodbUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtAccessTokenExpiresIn: process.env.JWT_EXPIRY!,
  env: process.env.NODE_ENV!,
};
