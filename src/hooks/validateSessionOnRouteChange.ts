import { useEffect } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { checkSession } from "../utils/api";

export const useRevalidateSessionOnRouteChange = () => {
  const location = useLocation();
  const { token, logout, setSessionValidity } = useAuth();

  useEffect(() => {
    const validateSession = async () => {
      if (token) {
        const response = await checkSession(token);
        if (response.success && response.data?.status) {
          setSessionValidity(true);
        } else {
          await logout();
          setSessionValidity(false);
        }
      } else {
        setSessionValidity(false);
      }
    };

    validateSession();
  }, [location, token, logout, setSessionValidity]);
};
