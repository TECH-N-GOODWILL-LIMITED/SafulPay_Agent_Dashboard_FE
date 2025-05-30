export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const requestOtp = async (
  phone: string,
  pin: string
): Promise<ApiResponse<{ sessionToken: string }>> => {
  try {
    const apiPhone = phone.startsWith("+") ? phone.slice(1) : phone;
    // const response = await fetch("/auth/request-otp", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ phone: apiPhone, pin }),
    // });
    // const data = await response.json();
    // Simulated response
    const data = { success: true, sessionToken: "abc123" };

    if (data.success) {
      return { success: true, data: { sessionToken: data.sessionToken } };
    } else {
      return {
        success: false,
        error: data.message || "Invalid phone number or PIN.",
      };
    }
  } catch (err) {
    return { success: false, error: `Error requesting OTP: ${err}` };
  }
};

export const verifyOtp = async (
  otp: string,
  sessionToken: string | null
): Promise<ApiResponse<{ redirectUrl: string }>> => {
  try {
    // const response = await fetch("/auth/verify-otp", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ otp, sessionToken }),
    // });
    // const data = await response.json();
    // Simulated response
    const data = { success: true, redirectUrl: "/" };

    if (data.success) {
      return { success: true, data: { redirectUrl: data.redirectUrl || "/" } };
    } else {
      return { success: false, error: data.message || "Invalid OTP." };
    }
  } catch (err) {
    return { success: false, error: `Error verifying OTP: ${err}` };
  }
};
