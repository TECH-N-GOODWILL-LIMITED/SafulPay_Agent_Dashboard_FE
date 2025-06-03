import type { ApiResponse } from "../types/types";
import type { LoginResponse } from "../types/types";
import type { User } from "../types/types";
import type { UserBio } from "../types/types";

const BASE_URL = "https://test.techengood.com";

export const requestOtp = async (
  phone: string
): Promise<ApiResponse<{ otp_id: string; message?: string }>> => {
  try {
    const response = await fetch(
      `https://ycd141j4sl.execute-api.us-east-1.amazonaws.com/v1/auth/send-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient: phone }),
        redirect: "follow",
      }
    );

    if (!response.ok) {
      if (response.status === 400) {
        return {
          success: false,
          error: "Invalid phone number. Please check and try again.",
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error: "Too many requests. Please try again later.",
        };
      }
      return {
        success: false,
        error: `Failed to send OTP. Server error (${response.status}).`,
      };
    }

    const text = await response.text();
    if (!text) {
      return {
        success: false,
        error: "Empty response from server. Please try again.",
      };
    }

    const data = JSON.parse(text);
    if (data.status) {
      return {
        success: true,
        data: { otp_id: data.otp_id, message: data.message },
      };
    }
    return { success: false, error: data.message || "Failed to send OTP." };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        success: false,
        error: "Invalid server response. Please try again.",
      };
    }
    return {
      success: false,
      error: "Failed to send OTP. Please check your connection.",
    };
  }
};

export const verifyOtpAndLogin = async (
  phone: string,
  pin: string,
  otpCode: string,
  otpId: string
): Promise<ApiResponse<{ token: string; user: User }>> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
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

    if (!response.ok) {
      if (response.status === 400) {
        return {
          success: false,
          error: "Invalid OTP or credentials. Please try again.",
        };
      }
      return {
        success: false,
        error: `Login failed. Server error (${response.status}).`,
      };
    }

    const text = await response.text();
    if (!text) {
      return {
        success: false,
        error: "Empty response from server. Please try again.",
      };
    }

    const data: LoginResponse = JSON.parse(text);
    if (data.status) {
      return {
        success: true,
        data: {
          token: data.data.access_token,
          user: data.data.user,
        },
      };
    }
    return { success: false, error: data.message || "Login failed." };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        success: false,
        error: "Invalid server response. Please try again.",
      };
    }
    return {
      success: false,
      error: "Failed to verify OTP. Please check your connection.",
    };
  }
};

export const getAllUsers = async (
  accessToken: string
): Promise<ApiResponse<{ users: UserBio[] }>> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/getAllUsers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: "follow",
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: "Session expired. Please sign in again.",
        };
      }
      return {
        success: false,
        error: `Failed to get users. Server error (${response.status}).`,
      };
    }

    const text = await response.text();
    if (!text) {
      return {
        success: false,
        error: "Empty response from server. Please try again.",
      };
    }

    const data = JSON.parse(text);
    if (data.status) {
      return { success: true, data: { users: data.data.users } };
    }
    return { success: false, error: data.message || "Failed to get users." };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        success: false,
        error: "Invalid server response. Please try again.",
      };
    }
    return {
      success: false,
      error: "Failed to retrieve users. Please check your connection.",
    };
  }
};
