export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserBio {
  id: number;
  name: string;
  businessName?: string;
  image?: string;
  phone: string;
  email: string;
  address?: string;
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
  name?: string;
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

export interface usersMetric {
  users: string;
  metric: number;
  currencySymbol?: boolean;
  // cash: string;
  // amount?: number;
}
