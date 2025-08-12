import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import { getAllAgents } from "../utils/api";
import type { AllAgentsData, GetAllAgentsParams } from "../types/types";
import { ADMIN_ROLE } from "../utils/roles";

interface AgentsContextType {
  allAgents: AllAgentsData | null;
  fetchAgents: (params: GetAllAgentsParams) => Promise<void>;
  title: string;
  error?: string;
  loading: boolean;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

export const useAgents = () => {
  const context = useContext(AgentsContext);
  if (!context) throw new Error("useAgents must be used within AgentsProvider");
  return context;
};

export const AgentsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allAgents, setAllAgents] = useState<AllAgentsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { token, user } = useAuth();

  const fetchAgents = useCallback(
    async (params: GetAllAgentsParams) => {
      setLoading(true);
      setError("");

      if (!token) {
        setTitle("Not authenticated");
        setError("Refresh page...");
        setLoading(false);
        return;
      }

      const response = await getAllAgents(token, params);
      if (response.success && response.data) {
        setAllAgents(response.data);
      } else {
        setTitle("Failed to fetch agents");
        setError(response.error || "Failed to fetch agents");
      }
      setLoading(false);
    },
    [token]
  );

  useEffect(() => {
    if (token && user?.role === ADMIN_ROLE) {
      fetchAgents({ page: 1, per_page: 10 });
    }
  }, [token, user]);

  return (
    <AgentsContext.Provider
      value={{
        allAgents,
        fetchAgents,
        title,
        error,
        loading,
      }}
    >
      {children}
    </AgentsContext.Provider>
  );
};
