import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { getAllMarketers, getMarketersStats } from "../utils/api";
import type {
  MarketerStats,
  GetAllMarketersParams,
  AllMarketersData,
} from "../types/types";
import { MARKETER_ROLE } from "../utils/roles";

interface MarketersContextType {
  allMarketers: AllMarketersData | null;
  marketerStats?: MarketerStats;
  fetchMarketers: (params?: GetAllMarketersParams) => Promise<void>;
  fetchMarketerStats: () => Promise<void>;
  error?: string;
  loading: boolean;
}

const MarketersContext = createContext<MarketersContextType | undefined>(
  undefined
);

export const useAllMarketers = () => {
  const context = useContext(MarketersContext);
  if (!context)
    throw new Error("useAllMarketers must be used within MarketersProvider");
  return context;
};

export const MarketersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allMarketers, setAllMarketers] = useState<AllMarketersData | null>(
    null
  );
  const [marketerStats, setMarketerStats] = useState<MarketerStats | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const { user, token } = useAuth();

  const fetchMarketers = async (params: GetAllMarketersParams = {}) => {
    setLoading(true);
    setError("");

    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const response = await getAllMarketers(token, params);
    if (response.success && response.data) {
      setAllMarketers(response.data);
      // setTotalMarketers(response.data.total_marketers);
    } else {
      setError(response.error || "Failed to fetch marketers");
    }
    setLoading(false);
  };

  const fetchMarketerStats = async () => {
    setLoading(true);
    setError("");

    // Removed token and user role check to allow unauthenticated access
    const response = await getMarketersStats();
    if (response.success && response.data) {
      setMarketerStats(response.data);
    } else {
      setError(response.error || "Failed to fetch marketer stats");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token && user?.role === MARKETER_ROLE) {
      fetchMarketers();
    }
    // Always fetch marketer stats regardless of authentication
    fetchMarketerStats();
  }, [token, user]);

  return (
    <MarketersContext.Provider
      value={{
        allMarketers,
        marketerStats,
        fetchMarketers,
        fetchMarketerStats,
        error,
        loading,
      }}
    >
      {children}
    </MarketersContext.Provider>
  );
};
