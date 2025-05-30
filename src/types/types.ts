export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: number;
  phone: string;
  role: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponseData {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: LoginResponseData;
  error?: [];
}

export interface UserBio {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: number;
  role: string;
}

export interface countryType {
  name: string;
  dialCode: string;
  code: string;
  flag: string;
  limitNumber: number;
  example: string;
}
