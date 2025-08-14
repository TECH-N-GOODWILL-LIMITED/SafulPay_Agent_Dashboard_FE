import type {
  Agent,
  ApiResponse,
  LoginResponseData,
  UserBio,
  LoginResponse,
  MarketerStats,
  BaseListData,
  AuditLogData,
  AllAgentsData,
  AllUsersData,
  GetAllUsersParams,
  GetAllAgentsParams,
  GetAllMarketersParams,
  GetAllAgentsByReferralParams,
  GetAuditLogsParams,
  DownloadParams,
  DownloadAgentsParams,
  DownloadAuditLogsParams,
  AllMarketersData,
  Vendor,
} from "../types/types";

const BASE_URL = import.meta.env.VITE_AGENCY_BASE_URL;
// const CORE_URL = import.meta.env.VITE_AGENCY_CORE_URL;

export const requestOtp = async (
  phone: string
): Promise<ApiResponse<{ otp_id: string; message?: string }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/sendOTP`, {
      method: "POST",
      headers: {
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        // "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: { otp_id: data.data.otp_id, message: data.message },
      };
    } else {
      return { success: false, error: data.message || "Failed to send OTP" };
    }
  } catch (err) {
    return { success: false, error: `Error requesting OTP: ${err}` };
  }
};

export const verifyOtpAndLogin = async (
  phone: string,
  pin: string,
  otpCode: string,
  otpId: string
): Promise<ApiResponse<LoginResponseData>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: phone,
        pin,
        otp_code: otpCode,
        otp_id: otpId,
      }),
      redirect: "follow",
    });

    const data: LoginResponse = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return { success: false, error: data.message || "Login failed" };
    }
  } catch (err) {
    return { success: false, error: `Error verifying OTP: ${err}` };
  }
};

export const logOut = async (
  accessToken: string
): Promise<ApiResponse<{ status: string; message?: string }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: { status: data.status, message: data.message },
      };
    } else {
      return { success: false, error: data.message || "Failed to logout user" };
    }
  } catch (err) {
    return { success: false, error: `Error logging user out: ${err}` };
  }
};

export const checkSession = async (
  accessToken: string
): Promise<ApiResponse<{ status: string; message?: string }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/checkSession`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: { status: data.status, message: data.message },
      };
    } else {
      return { success: false, error: data.message || "Failed to logout user" };
    }
  } catch (err) {
    return { success: false, error: `Error logging user out: ${err}` };
  }
};

export const checkUserExist = async (
  phone: string
): Promise<ApiResponse<{ status: string; message?: string }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/checkUserExist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: { status: data.status, message: data.message },
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to check user existence ",
      };
    }
  } catch (err) {
    return { success: false, error: `Error checking user existence: ${err}` };
  }
};

export const checkPhoneType = async (
  phone: string
): Promise<
  ApiResponse<{ status: string; message?: string; type?: string }>
> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/agents/checkPhoneType`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: {
          status: data.status,
          message: data.message,
          type: data.data.type,
        },
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to check phone existence ",
      };
    }
  } catch (err) {
    return { success: false, error: `Error checking phone existence: ${err}` };
  }
};

export const getAllUsers = async (
  accessToken: string,
  params: GetAllUsersParams = {}
): Promise<ApiResponse<AllUsersData>> => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${BASE_URL}/auth/getAllUsers?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || "Failed to get users" };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving users: ${err}` };
  }
};

export const getAllAgents = async (
  accessToken: string,
  params: GetAllAgentsParams
): Promise<ApiResponse<AllAgentsData>> => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${BASE_URL}/auth/agents/getAllAgents?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );

    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || "Failed to get agents" };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving agents: ${err}` };
  }
};

export const getAllVendors = async (
  coreApiToken: string
): Promise<
  ApiResponse<{
    vendors: Vendor[];
  }>
> => {
  try {
    const response = await fetch(`/vendor/core/merchantvendorlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${coreApiToken}`,
      },
      redirect: "follow",
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: { vendors: data.vendors || [] },
      };
    } else {
      return { success: false, error: data.message || "Failed to get vendors" };
    }
  } catch (err) {
    return { success: false, error: `Error getting vendors: ${err}` };
  }
};

export const getAllMarketers = async (
  accessToken: string,
  params: GetAllMarketersParams = {}
): Promise<ApiResponse<AllMarketersData>> => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${BASE_URL}/auth/getAllMarketers?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data,
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to get marketers",
      };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving marketers: ${err}` };
  }
};

export const getAllAgentsByReferral = async (
  accessToken: string,
  ref: string,
  params: GetAllAgentsByReferralParams = {}
): Promise<ApiResponse<{ total: number; user: UserBio; agents: Agent[] }>> => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${BASE_URL}/auth/agents/getAllAgentByReferrals/${ref}?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: {
          total: data.data.total,
          user: data.data.user_info,
          agents: data.data.agent_info,
        },
      };
    } else {
      return { success: false, error: data.message || "Failed to get agents" };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving agents: ${err}` };
  }
};

export const getUserByReferralCode = async (
  ref: string
): Promise<ApiResponse<{ user: UserBio }>> => {
  try {
    const response = await fetch(
      `${BASE_URL}/auth/getUserByReferralCode/${ref}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { user: data.data.user } };
    } else {
      return {
        success: false,
        error: data.message || "Failed to get user information",
      };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving user info: ${err}` };
  }
};

export const getAgentById = async (
  accessToken: string,
  agentId: string
): Promise<ApiResponse<{ agent: Agent }>> => {
  try {
    const response = await fetch(
      `${BASE_URL}/auth/agents/getAgentById/${agentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { agent: data.data } };
    } else {
      return { success: false, error: data.message || "Failed to get agent" };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving agent: ${err}` };
  }
};

export const registerUser = async (
  accessToken: string,
  phone: string,
  role: string
): Promise<ApiResponse<{ user: UserBio }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ phone, role }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { user: data.data.user } };
    } else {
      return {
        success: false,
        error: data.errors.phone
          ? data.errors.phone[0]
          : data.message || "Failed to onboard agent",
      };
    }
  } catch (err) {
    return { success: false, error: `Error registering user: ${err}` };
  }
};

export const addAgent = async (
  formData: FormData
): Promise<ApiResponse<{ agent: Agent }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/agents/onboardAgent`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
      redirect: "follow",
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { agent: data.data } };
    } else {
      console.log(data);
      return {
        success: false,
        error: data.errors.phone
          ? data.errors.phone[0]
          : data.errors.email
          ? data.errors.email[0]
          : data.message || "Failed to onboard agent",
      };
    }
  } catch (err) {
    return { success: false, error: `Error onboarding agent: ${err}` };
  }
};

export const updateAgentInfo = async (
  accessToken: string,
  agentId: string,
  updatedFields: Partial<Agent>,
  reason: string,
  masterId?: number | null
): Promise<ApiResponse<{ agent: Agent }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/agents/updateAgent`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        agent_id: agentId,
        ...updatedFields,
        reason,
        ...(masterId !== undefined && { master_id: masterId }),
      }),
      redirect: "follow",
    });

    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { agent: data.data } };
    } else {
      return {
        success: false,
        error: data.errors.phone
          ? data.errors.phone[0]
          : data.errors.email
          ? data.errors.email[0]
          : data.message || "Failed to update agent",
      };
    }
  } catch (err) {
    return { success: false, error: `Error updating agent: ${err}` };
  }
};

export const changeUserStatus = async (
  accessToken: string,
  userId: number,
  status: number,
  reason: string
): Promise<ApiResponse<{ user: UserBio }>> => {
  try {
    console.log(status, userId);
    const response = await fetch(`${BASE_URL}/auth/changeUserStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: Number(userId), status, reason }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { user: data.data.user } };
    } else {
      return {
        success: false,
        error: data.message || "Failed to change user status",
      };
    }
  } catch (err) {
    return { success: false, error: `Error changing user status: ${err}` };
  }
};

export const changeAgentStatus = async (
  accessToken: string,
  agentId: number,
  status: number,
  reason: string,
  masterId?: number
): Promise<ApiResponse<{ agent: Agent }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/agents/changeAgentStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        agent_id: agentId,
        status,
        reason,
        ...(masterId !== undefined && { master_id: masterId }),
      }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { agent: data.data.agent } };
    } else {
      return {
        success: false,
        error: data.message || "Failed to change agent status",
      };
    }
  } catch (err) {
    console.log(err);
    return { success: false, error: `Error changing agent status: ${err}` };
  }
};

export const getMarketersStats = async (): Promise<
  ApiResponse<MarketerStats>
> => {
  try {
    const response = await fetch(
      `${BASE_URL}/auth/agents/dashboard/marketer-agent-stats`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data };
    } else {
      return {
        success: false,
        error: data.message || "Error getting marketers statistics",
      };
    }
  } catch (err) {
    return { success: false, error: `Error fetching marketers stats: ${err}` };
  }
};

export const getAuditLogs = async (
  accessToken: string,
  params: GetAuditLogsParams = {}
): Promise<ApiResponse<BaseListData<AuditLogData[]>>> => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${BASE_URL}/auth/logs/audit-logs?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data };
    } else {
      return {
        success: false,
        error: data.message || "Error getting audit logs",
      };
    }
  } catch (err) {
    return { success: false, error: `Error fetching audit trail logs: ${err}` };
  }
};

export const uploadToCloudinary = async (
  file: File,
  cloudName: string,
  uploadPreset: string
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const uploadResponse = await fetch(
      `https:/${BASE_URL}.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await uploadResponse.json();
    if (data.secure_url) {
      return { success: true, url: data.secure_url };
    }
    return { success: false, error: data.error?.message || "Upload failed" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

// Download/Export API functions
export const downloadUsersData = async (
  accessToken: string,
  params: DownloadParams
): Promise<ApiResponse<{ data: UserBio[] }>> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${BASE_URL}/auth/users/export?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { data: data.data.records } };
    } else {
      return {
        success: false,
        error: data.message || "Error downloading users data",
      };
    }
  } catch (err) {
    return { success: false, error: `Error downloading users data: ${err}` };
  }
};

export const downloadAgentsData = async (
  accessToken: string,
  params: DownloadAgentsParams
): Promise<ApiResponse<{ data: Agent[] }>> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${BASE_URL}/auth/agents/export?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { data: data.data.records } };
    } else {
      return {
        success: false,
        error: data.message || "Error downloading agents data",
      };
    }
  } catch (err) {
    return { success: false, error: `Error downloading agents data: ${err}` };
  }
};

export const downloadAuditLogsData = async (
  accessToken: string,
  params: DownloadAuditLogsParams
): Promise<ApiResponse<{ data: AuditLogData[] }>> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const response = await fetch(
      `${BASE_URL}/auth/logs/export?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { data: data.data.records } };
    } else {
      return {
        success: false,
        error: data.message || "Error downloading audit logs data",
      };
    }
  } catch (err) {
    return {
      success: false,
      error: `Error downloading audit logs data: ${err}`,
    };
  }
};
