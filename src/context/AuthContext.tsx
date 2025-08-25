import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { checkSession, logOut, refreshToken } from "../utils/api";
import {
  clearResponseCookies,
  getResponseCookies,
  setResponseCookies,
} from "../utils/authCookies";
import type { LoginResponseData, UserBio } from "../types/types";

interface AuthContextType {
  user: UserBio | null;
  token: string | null;
  coreApiToken: string | null;
  login: (data: LoginResponseData, keepLoggedIn: boolean) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isLoggedIn: boolean | null;
  setSessionValidity: (valid: boolean) => void;
  onboardingUser: UserBio | null;
  setOnboardingUser: (user: UserBio | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [responseData, setResponseData] = useState<LoginResponseData | null>(
    getResponseCookies
  );
  const [onboardingUser, setOnboardingUser] = useState<UserBio | null>(null);

  const user = responseData?.user || null;
  const token = responseData?.access_token || null;
  const coreApiToken = responseData?.core_api_bearer_token || null;

  const login = (data: LoginResponseData, keepLoggedIn: boolean) => {
    setResponseData(data);
    setResponseCookies(data, keepLoggedIn);
  };

  const refreshTokenHandler = async () => {
    if (!token) return;

    try {
      const response = await refreshToken(token);
      if (response.success && response.data) {
        // Spread existing responseData and only update the tokens
        const updatedData: LoginResponseData = {
          ...responseData!,
          access_token: response.data.accessToken,
          core_api_bearer_token: response.data.coreApiToken,
        };

        setResponseData(updatedData);

        // Determine keepLoggedIn preference from existing cookies
        const existingData = getResponseCookies();
        // If cookies exist and have an expiration date, keep logged in
        const keepLoggedIn = existingData ? true : false;
        setResponseCookies(updatedData, keepLoggedIn);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout the user
      await logout();
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logOut(token);
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      setResponseData(null);
      clearResponseCookies();
    }
  };

  useEffect(() => {
    const validateSession = async () => {
      if (token) {
        const response = await checkSession(token);
        if (response.success && response.data?.status) {
          setIsLoggedIn(true);
        } else {
          await logout();
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    validateSession();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        coreApiToken,
        login,
        logout,
        refreshToken: refreshTokenHandler,
        isLoggedIn,
        setSessionValidity: (valid: boolean) => setIsLoggedIn(valid),
        onboardingUser,
        setOnboardingUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
