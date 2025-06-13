import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { logOut } from "../utils/api";
import {
  clearResponseCookies,
  getResponseCookies,
  setResponseCookies,
} from "../utils/authCookies";
import type { LoginResponseData, UserBio } from "../types/types";

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

  const logout = async () => {
    if (token) {
      await logOut(token); // optional: handle response
    }

    setResponseDataState(null);
    clearResponseCookies();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
