export enum Role {
  Admin = "Admin",
  Agent = "Agent",
  Marketer = "Marketer",
  Rider = "Rider",
  Accountant = "Accountant",
}

export enum Status {
  Active = 1,
  Pending = 2,
  Suspended = 3,
}

export enum TransactionStatus {
  Completed = "Completed",
  Pending = "Pending",
  Failed = "Failed",
}

export interface BaseUser {
  id: number;
  business_name?: string;
  firstname?: string;
  lastname?: string;
  name: string;
  username?: string;
  phone: string;
  email: string;
  image?: string;
  country_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | { message: string; code?: string };
}

export interface UserBio extends BaseUser {
  address?: string;
  status: Status;
  role: Role;
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
  error?: string;
}

export interface Marketer extends BaseUser {
  status: Status;
  role_id: number;
  bearer_token: string;
  // Only used in Agent.marketer; review if needed
}

export interface Agent extends BaseUser {
  master_id?: string;
  model: string;
  category: string;
  status: Status;
  role: Role; // Added to align with UserBio and AgentWithRole
  threshold_wallet_balance: number;
  threshold_cash_in_hand: number;
  residual_amount: number;
  latitude: number;
  longitude: number;
  marketer: Marketer | null;
}

export interface AgentResponse {
  status: boolean;
  message: string;
  data: { agents: Agent[] };
}

export interface countryType {
  name: string;
  dialCode: string;
  code: string;
  flag: string;
  limitNumber: number; // Positive integer
  example: string;
}

export interface usersMetric {
  users: string;
  metric: number;
  currencySymbol?: boolean;
}

export enum TransactionType {
  Deposit = "Deposit",
  Withdrawal = "Withdrawal",
  Disbursement = "Disbursement",
  Recollection = "Recollection",
  Overdue = "Overdue",
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
  user_id: number;
  details?: string;
  // Review if used in RecentOrders
}
