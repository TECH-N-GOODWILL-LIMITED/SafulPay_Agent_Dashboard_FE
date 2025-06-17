import type { Agent, ApiResponse, LoginResponseData } from "../types/types";
import type { LoginResponse } from "../types/types";
import type { UserBio } from "../types/types";
import type { Status } from "../types/types";

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
      console.log(data.data);

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
      return {
        success: true,
        data: {
          agents: data.data.map((agent: Agent) => ({
            ...agent,
            threshold_wallet_balance: Number(agent.threshold_wallet_balance),
            threshold_cash_in_hand: Number(agent.threshold_cash_in_hand),
            residual_amount: Number(agent.residual_amount),
            latitude: Number(agent.latitude),
            longitude: Number(agent.longitude),
          })),
        },
      };
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

export const changeUserStatus = async (
  accessToken: string,
  id: number,
  status: Status
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/changeUserStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id, status }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: { message: data.message || "Status updated" },
      };
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
  id: number,
  status: Status
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/agents/changeAgentStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ master_id: id, status }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: { message: data.message || "Status updated" },
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to change agent status",
      };
    }
  } catch (err) {
    return { success: false, error: `Error changing agent status: ${err}` };
  }
};
