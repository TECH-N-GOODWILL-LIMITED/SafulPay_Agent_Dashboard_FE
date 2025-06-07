import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { LoginResponseData, UserBio } from "../types/types";
import {
  clearResponseCookies,
  getResponseCookies,
  setResponseCookies,
} from "../utils/authCookies";

interface AuthContextType {
  user: UserBio | null;
  token: string | null;
  login: (data: LoginResponseData, keepLoggedIn: boolean) => void;
  logout: () => void;
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
  const [responseData, setResponseDataState] =
    useState<LoginResponseData | null>(() => {
      return getResponseCookies();
    });

  useEffect(() => {
    const data = getResponseCookies();
    if (data && data !== responseData) {
      setResponseDataState(data);
    }
  }, []);

  const user = responseData?.user || null;
  const token = responseData?.access_token || null;

  const login = (data: LoginResponseData, keepLoggedIn: boolean) => {
    setResponseDataState(data);
    setResponseCookies(data, keepLoggedIn);
  };

  const logout = () => {
    setResponseDataState(null);
    clearResponseCookies();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
