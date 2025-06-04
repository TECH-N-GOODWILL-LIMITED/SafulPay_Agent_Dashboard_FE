import Cookies from "js-cookie";
import { LoginResponseData } from "../types/types";

export const setResponseCookies = (
  data: LoginResponseData,
  keepLoggedIn: boolean
) => {
  Cookies.set("responseData", JSON.stringify(data), {
    expires: keepLoggedIn ? 30 : undefined,
    secure: true,
    sameSite: "Strict",
  });
};

export const getResponseCookies = (): LoginResponseData | null => {
  const dataStr = Cookies.get("responseData");
  if (!dataStr) return null;
  try {
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
};

export const clearResponseCookies = () => {
  Cookies.remove("responseData");
};
