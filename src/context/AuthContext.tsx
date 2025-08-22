import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { checkSession, logOut } from "../utils/api";
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
