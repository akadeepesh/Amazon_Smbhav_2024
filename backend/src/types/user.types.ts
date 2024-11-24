

export interface IUserDocument  {
  _id: string;
  email: string;
  password: string;
  name: string;
  
  videos: string[];  // Array of Video ObjectIds
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}