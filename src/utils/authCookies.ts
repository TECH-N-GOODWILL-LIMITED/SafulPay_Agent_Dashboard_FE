import Cookies from "js-cookie";
import { LoginResponseData } from "../types/types";

export const setResponseCookies = (
  data: LoginResponseData,
  keepLoggedIn: boolean
) => {
  Cookies.set("responseData", JSON.stringify(data), {
    expires: keepLoggedIn ? 30 : undefined,
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
    sameSite: "Lax" as const,
    path: "/",
  });
};

export const getResponseCookies = (): LoginResponseData | null => {
  const dataStr = Cookies.get("responseData");
  let parsed: LoginResponseData | null = null;

  if (dataStr) {
    try {
      parsed = JSON.parse(dataStr) as LoginResponseData;
    } catch {
      parsed = null;
    }
  }

  // Fallback inject tokens from dedicated cookies if missing
  const access = Cookies.get("access_token") || parsed?.access_token || null;
  const core =
    Cookies.get("core_api_bearer_token") ||
    parsed?.core_api_bearer_token ||
    null;

  if (!parsed && !access && !core) return null;

  return {
    ...(parsed ?? ({} as LoginResponseData)),
    access_token: access ?? "",
    core_api_bearer_token: core ?? "",
  };
};

export const clearResponseCookies = () => {
  Cookies.remove("responseData", { path: "/" });
  Cookies.remove("access_token", { path: "/" });
  Cookies.remove("core_api_bearer_token", { path: "/" });
};
