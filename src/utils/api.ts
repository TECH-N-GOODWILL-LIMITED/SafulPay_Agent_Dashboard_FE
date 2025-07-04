import type { Agent, ApiResponse, LoginResponseData } from "../types/types";
import type { LoginResponse } from "../types/types";
import type { UserBio } from "../types/types";

const BASE_URL = "https://test.techengood.com/api";

export const requestOtp = async (
  phone: string
): Promise<ApiResponse<{ otp_id: string; message?: string }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/sendOTP`, {
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

export const getAllUsers = async (
  accessToken: string
): Promise<ApiResponse<{ users: UserBio[] }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/getAllUsers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { users: data.data.users } };
    } else {
      return { success: false, error: data.message || "Failed to get users" };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving users: ${err}` };
  }
};

export const getAllAgents = async (
  accessToken: string
): Promise<ApiResponse<{ agents: Agent[] }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/agents/getAllAgents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { agents: data.data } };
    } else {
      return { success: false, error: data.message || "Failed to get agents" };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving agents: ${err}` };
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
        error: data.errors.phone || "Failed to register user",
      };
    }
  } catch (err) {
    return { success: false, error: `Error registering user: ${err}` };
  }
};

export const addAgent = async (
  accessToken: string,
  formData: FormData
): Promise<ApiResponse<{ agent: Agent }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/agents/onboardAgent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return { success: true, data: { agent: data.data } };
    } else {
      return {
        success: false,
        error: data.message || "Failed to onboard agent",
      };
    }
  } catch (err) {
    return { success: false, error: `Error onboarding agent: ${err}` };
  }
};

export const changeUserStatus = async (
  accessToken: string,
  userId: number,
  status: number
): Promise<ApiResponse<{ user: UserBio }>> => {
  try {
    console.log(status, userId);
    const response = await fetch(`${BASE_URL}/auth/changeUserStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: Number(userId), status }),
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
  status: number
): Promise<ApiResponse<{ agent: Agent }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/agents/changeAgentStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ agent_id: String(agentId), status }),
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

export const validateToken = async (
  accessToken: string
): Promise<ApiResponse<{ valid: boolean }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/validate-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    if (response.ok && data.status) {
      return { success: true, data: { valid: true } };
    } else {
      return { success: false, error: data.message || "Invalid token" };
    }
  } catch (err) {
    return { success: false, error: `Error validating token: ${err}` };
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
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
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
// ! Check this out, to implement pagination in the future
/**
 * 
 * 
 * pagination
: 
{current_page: 1, per_page: 10, total: 9, last_page: 1, next_page_url: null, prev_page_url: null}
current_page
: 
1
last_page
: 
1
next_page_url
: 
null
per_page
: 
10
prev_page_url
: 
null
total
: 
9

 */
