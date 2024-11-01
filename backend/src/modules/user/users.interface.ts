export interface UserData {
  email: string;
  username?: string;
  [key: string]: any; // Allow additional properties
}

export interface ServiceResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}
