import type { ApiResponse } from "../types/types";
import type { LoginResponse } from "../types/types";
import type { User } from "../types/types";
import type { UserBio } from "../types/types";

export const requestOtp = async (
  phone: string
): Promise<ApiResponse<{ otp_id: string; message?: string }>> => {
  try {
    const response = await fetch("/api/v1/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient: phone }),
      redirect: "follow",
    });
    const data = await response.json();

    if (response.ok && data.status) {
      return {
        success: true,
        data: { otp_id: data.otp_id, message: data.message },
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
): Promise<ApiResponse<{ token: string; user: User }>> => {
  try {
    const response = await fetch("https://test.techengood.com/api/auth/login", {
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

    console.log(data);

    if (response.ok && data.status) {
      console.log(data);
      return {
        success: true,
        data: {
          token: data.data.access_token,
          user: data.data.user,
        },
      };
    } else {
      return { success: false, error: data.message || "Login failed" };
    }
  } catch (err) {
    return { success: false, error: `Error verifying OTP: ${err}` };
  }
};

export const getAllUsers = async (
  accessToken: string
): Promise<ApiResponse<{ users: UserBio[] }>> => {
  try {
    const response = await fetch(
      "https://test.techengood.com/api/auth/getAllUsers",
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
      return { success: true, data: { users: data.data.users } };
    } else {
      return { success: false, error: data.message || "Failed to get users" };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving users: ${err}` };
  }
};
