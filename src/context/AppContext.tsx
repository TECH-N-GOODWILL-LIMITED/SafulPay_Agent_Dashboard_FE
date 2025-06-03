import { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

interface AppContextType {
  accessToken: string | null;
  setToken: (token: string, keepLoggedIn: boolean) => void;
  clearToken: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    Cookies.get("accessToken") || null
  );

  const setToken = (token: string, keepLoggedIn: boolean) => {
    setAccessToken(token);
    Cookies.set("accessToken", token, {
      expires: keepLoggedIn ? 7 : undefined,
      secure: true,
      sameSite: "Strict",
    });
  };

  const clearToken = () => {
    setAccessToken(null);
    Cookies.remove("accessToken");
  };

  return (
    <AppContext.Provider value={{ accessToken, setToken, clearToken }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
