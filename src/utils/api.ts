export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: number;
  role: string;
}

export const requestOtp = async (
  phone: string,
  pin: string
): Promise<ApiResponse<{ sessionToken: string }>> => {
  try {
    const apiPhone = phone.startsWith("+") ? phone.slice(1) : phone;
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

export const getAllUsers = async (
  accessToken: string
): Promise<ApiResponse<{ users: User[] }>> => {
  try {
    // const response = await fetch("https://test.techengood.com/api/auth/getAllUsers", {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${accessToken}`,
    //   },
    // });
    // const data = await response.json();
    const data = {
      status: true,
      message: "Users retrieved successfully",
      data: {
        users: [
          {
            id: 1,
            name: "Toluwani Adepoju",
            email: "tmedal007@gmail.com",
            phone: "23278672866",
            status: 1,
            role: "Marketer",
          },
          {
            id: 2,
            name: "Osman Kamara",
            email: "ockamara@gmail.com",
            phone: "23230737385",
            status: 1,
            role: "Admin",
          },
          {
            id: 8,
            name: "Abdul Barry",
            email: "abdulrahimbarrie22@gmail.com",
            phone: "23234546611",
            status: 1,
            role: "Marketer",
          },
          {
            id: 9,
            name: "Oyinlola Lawal",
            email: "oyinn.lawal@techengood.com",
            phone: "23230249205",
            status: 1,
            role: "Rider",
          },
          {
            id: 10,
            name: "Umaru Kamara",
            email: "umarujnr@gmail.com",
            phone: "23279750529",
            status: 1,
            role: "Rider",
          },
        ],
      },
    };

    if (data.status) {
      return { success: true, data: { users: data.data.users } };
    } else {
      return {
        success: false,
        error: data.message || "Failed to retrieve users.",
      };
    }
  } catch (err) {
    return { success: false, error: `Error retrieving users: ${err}` };
  }
};
