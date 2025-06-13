export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserBio {
  id: number;
  business_name?: string;
  firstname?: string;
  lastname?: string;
  name: string;
  username?: string;
  phone: string;
  image?: string;
  email: string;
  address?: string;
  country_code?: string;
  status: number;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponseData {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserBio;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: LoginResponseData;
  error?: [];
}

export interface Marketer {
  id: number;
  firstname: string;
  lastname: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  image?: string;
  status: number;
  role_id: number;
  country_code?: string;
  bearer_token: string;
  // created_at: string;
  // updated_at: string;
}

export interface Agent {
  id: number;
  master_id?: string;
  business_name: string;
  firstname: string;
  lastname: string;
  name: string;
  username?: string;
  phone: string;
  email: string;
  image?: string;
  model: string;
  category: string;
  status: string;
  threshold_wallet_balance: string;
  threshold_cash_in_hand: string;
  residual_amount: string;
  latitude: string;
  longitude: string;
  created_at?: string;
  updated_at?: string;
  marketer: Marketer | null;
}

export interface AgentResponse {
  status: boolean;
  message: string;
  data: Agent[];
}

export interface countryType {
  name: string;
  dialCode: string;
  code: string;
  flag: string;
  limitNumber: number;
  example: string;
}

export interface usersMetric {
  users: string;
  metric: number;
  currencySymbol?: boolean;
  // cash: string;
  // amount?: number;
}
