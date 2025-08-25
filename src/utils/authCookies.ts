import Cookies from "js-cookie";
import type { LoginResponseData } from "../types/types";

export const setResponseCookies = (
  data: LoginResponseData,
  keepLoggedIn: boolean
) => {
  const cookieOptions = {
    secure: true,
    sameSite: "Strict" as const,
  };

  if (keepLoggedIn) {
    // Set cookie to expire in 30 days
    Cookies.set("responseData", JSON.stringify(data), {
      ...cookieOptions,
      expires: 30,
    });
  } else {
    // Session cookie (expires when browser closes)
    Cookies.set("responseData", JSON.stringify(data), cookieOptions);
  }
};

export const getResponseCookies = (): LoginResponseData | null => {
  const dataStr = Cookies.get("responseData");
  if (!dataStr) return null;
  try {
    const data = JSON.parse(dataStr) as LoginResponseData;
    return data;
  } catch {
    return null;
  }
};

export const clearResponseCookies = () => {
  Cookies.remove("responseData");
};
