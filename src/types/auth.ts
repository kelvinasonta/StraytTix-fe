export interface User {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface MeData {
  user: User;
  email_verified: boolean;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface LoginRequest {
  email: string;
  password?: string;
  remember?: boolean;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone?: string;
  timezone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string;
}
