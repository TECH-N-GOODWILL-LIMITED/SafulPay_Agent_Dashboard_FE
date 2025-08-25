import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

export const useUserActivityTokenRefresh = () => {
  const { refreshToken, token } = useAuth();
  const lastRefreshTime = useRef<number>(0);
  const refreshCooldown = 5 * 60 * 1000; // 5 minutes cooldown between refreshes

  const handleUserActivity = useCallback(async () => {
    // Only proceed if user is authenticated
    if (!token) return;

    const now = Date.now();

    // Only refresh if enough time has passed since last refresh
    if (now - lastRefreshTime.current > refreshCooldown) {
      try {
        lastRefreshTime.current = now;
        await refreshToken();
      } catch (error) {
        console.error("Failed to refresh token on user activity:", error);
      }
    }
  }, [refreshToken, token]);

  useEffect(() => {
    // Only add event listeners if user is authenticated
    if (!token) return;

    // Track various user interactions
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const eventHandlers = events.map((event) => {
      const handler = () => handleUserActivity();
      return { event, handler };
    });

    // Add event listeners
    eventHandlers.forEach(({ event, handler }) => {
      document.addEventListener(event, handler, { passive: true });
    });

    // Cleanup
    return () => {
      eventHandlers.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler);
      });
    };
  }, [handleUserActivity, token]);

  return { handleUserActivity };
};
