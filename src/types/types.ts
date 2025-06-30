export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserBio {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  username?: string;
  business_name?: string;
  phone: string;
  email: string;
  image?: string;
  address?: string;
  referral_code: string;
  country_code: string;
  role: string;
  status: number;
  created_at: string;
  updated_at: string;
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

// export interface Marketer {
//   id: number;
//   firstname: string;
//   lastname: string;
//   name: string;
//   username: string;
//   phone: string;
//   email: string;
//   image?: string;
//   status: number;
//   role_id: number;
//   country_code?: string;
//   bearer_token: string;
//   created_at: string;
//   updated_at: string;
// }

export interface Users {
  id: number;
  master_id?: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  name: string;
  username: string;
  business_name?: string;
  business_phone?: string;
  phone: string;
  email: string;
  image?: string;
  role: string;
  type?: string;
  model?: string;
  address?: string;
  region?: string;
  district?: string;
  latitude?: string;
  longitude?: string;
  id_type?: string;
  id_document?: string;
  bussiness_registration?: string;
  bussiness_image?: string;
  marketer_referralcode?: string;
  threshold_wallet_balance?: string;
  threshold_cash_in_hand?: string;
  residual_amount?: string;
  status: number;
  created_at: string;
  updated_at: string;
  // marketer: Marketer | null;
}
export interface Agent {
  id: number;
  master_id?: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  name: string;
  username: string;
  business_name: string;
  business_phone: string;
  phone: string;
  email: string;
  image?: string;
  type: "Agent" | "Merchant";
  model?: "Target" | "Independent";
  address: string;
  region?: string;
  district?: string;
  latitude: string;
  longitude: string;
  id_type: string;
  id_document: string;
  bussiness_registration: string;
  bussiness_image: string;
  marketer_referralcode: string;
  threshold_wallet_balance: string;
  threshold_cash_in_hand: string;
  residual_amount: string;
  status: number;
  created_at: string;
  updated_at: string;
  // marketer: Marketer | null;
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
