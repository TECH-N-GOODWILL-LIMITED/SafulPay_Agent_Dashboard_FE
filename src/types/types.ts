export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface UserBio {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  country_code: string;
  image?: string;
  status: number;
  address?: string;
  referral_code: string;
  role: string;
  created_at: string;
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

// NOTE: Comon denomination of Agent and Users👇🏼
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
  business_registration?: string;
  business_image?: string;
  referral_code: string;
  ref_by?: string;
  threshold_wallet_balance?: string;
  threshold_cash_in_hand?: number;
  residual_amount?: number;
  temp?: number;
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
  business_phone?: string;
  phone?: string;
  email?: string;
  image?: string;
  type: string | "Merchant" | "Super Agent" | "Agent";
  model?: string | "Target" | "Independent";
  address: string;
  address_document?: string;
  region?: string;
  district: string;
  latitude: string;
  longitude: string;
  id_type?: string;
  id_document?: string;
  business_registration?: string;
  business_image?: string;
  referral_code: string;
  ref_by?: string;
  threshold_wallet_balance?: string;
  threshold_cash_in_hand: number;
  residual_amount: number;
  status: number;
  temp: number;
  created_at: string;
  updated_at: string;
  // marketer: Marketer | null;
}

export interface Vendor {
  id: number;
  firstname: string;
  lastname: string;
  mobile: string;
  status: string;
  kyc_status: string;
  vendor_type: string;
}

export interface BaseListData<T> {
  total_filter_result: number;
  current_page: number;
  per_page: number;
  last_page: number;
  data: T;
}

export interface AllAgentsData extends BaseListData<Agent[]> {
  total_all_agents: number;
  total_independent_agents: number;
  total_target_agents: number;
  total_super_agents: number;
  total_merchants: number;
  total_agents: number;
}

export interface UpdatedAgentFields extends Partial<Agent> {
  reason: string;
}

interface BaseAgentsPerWeek {
  year: number;
  week: number;
}

interface TotalAgentsPerWeek extends BaseAgentsPerWeek {
  total_agents: number;
}

interface AgentsThisWeek extends BaseAgentsPerWeek {
  agents_this_week?: number;
}

interface BasicInfo {
  firstname: string;
  lastname: string;
  username: string;
  referral_code: string;
  total_agents: number;
  weekly_agents: AgentsThisWeek[];
}

export interface BasicMarketerInfo extends BasicInfo {
  marketer_id: number;
}

export interface MarketerStats {
  total_agents_by_marketers: number;
  total_agents: number;
  total_all_agents?: number;
  total_agents_per_week: TotalAgentsPerWeek[];
  data: BasicMarketerInfo[];
}

export interface AuditLogData {
  id: number;
  action: string;
  table: string;
  performed_by: {
    user_id: string;
    name: string;
    role: string;
  };
  description: string;
  reason: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AllUsersData extends BaseListData<{ users: UserBio[] }> {
  total_all_users: number;
  total_admin: number;
  total_marketer: number;
  total_accountant: number;
  total_rider: number;
}

interface BasicParams {
  page?: number;
  per_page?: number;
  startDate?: string;
  endDate?: string;
}

// API Parameter Types
export interface GetAllUsersParams extends BasicParams {
  role?: string;
  status?: string | number;
  name?: string;
}

export interface GetAllAgentsParams extends BasicParams {
  type?: string;
  model?: string;
  ref_by?: string;
  temp?: string | number;
  status?: string | number;
  name?: string;
}

export interface GetAllMarketersParams extends BasicParams {
  status?: string | number;
  name?: string;
}
export interface GetAllAgentsByReferralParams extends BasicParams {
  status?: string | number;
  type?: string;
  model?: string;
}

export interface GetAuditLogsParams extends BasicParams {
  action?: string;
  performed_by?: string;
  description?: string;
}

export interface DownloadAuditLogsParams extends BasicParams {
  format: "csv" | "excel";
  action?: string;
  table?: string;
  performed_by?: string;
  description?: string;
}

export interface AllMarketersData
  extends BaseListData<{ marketers: UserBio[] }> {
  total_marketers: number;
}

export interface DownloadParams extends GetAllUsersParams {
  format: "csv" | "excel";
}

export interface DownloadAgentsParams extends GetAllAgentsParams {
  format: "csv" | "excel";
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
}
