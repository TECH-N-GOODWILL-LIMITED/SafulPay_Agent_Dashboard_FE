import { useEffect } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { checkSession } from "../utils/api";

export const useRevalidateSessionOnRouteChange = () => {
  const location = useLocation();
  const { token, logout, setSessionValidity, refreshToken } = useAuth();

  useEffect(() => {
    const validateSession = async () => {
      if (token) {
        const response = await checkSession(token);

        if (response.success && response.data?.status) {
          setSessionValidity(true);
        } else {
          // Try to refresh token before logging out
          try {
            await refreshToken();
            // If refresh succeeds, session is valid
            setSessionValidity(true);
          } catch (error) {
            // If refresh fails, logout
            await logout();
            setSessionValidity(false);
          }
        }
      } else {
        await logout();
        setSessionValidity(false);
      }
    };

    validateSession();
  }, [location, token, logout, setSessionValidity, refreshToken]);
};
