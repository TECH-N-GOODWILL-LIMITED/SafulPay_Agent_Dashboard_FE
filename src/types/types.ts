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

export interface UserBio {
  id: number;
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  image?: string;
  status: number;
  role: string;
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

export interface Marketer {
  id: number;
  name: string;
  email: string;
  phone: string;
  image?: string;
  status: number;
  role_id: number;
  bearer_token: string;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: number;
  marketer_id: string;
  business_name: string;
  latitude: string;
  longitude: string;
  model: string;
  threshold_wallet_balance: string;
  category: string;
  threshold_cash_in_hand: string;
  residual_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  email: string;
  phone: string;
  master_id: string | null;
  marketer: Marketer | null;
}

export interface AgentResponse {
  status: boolean;
  message: string;
  agents: Agent[];
}

export interface countryType {
  name: string;
  dialCode: string;
  code: string;
  flag: string;
  limitNumber: number;
  example: string;
}
