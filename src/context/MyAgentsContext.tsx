import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { getAllAgentsByReferral } from "../utils/api";
import { useAuth } from "./AuthContext";
import type { Agent, UserBio } from "../types/types";

interface MyAgentsContextType {
  agents: Agent[];
  total: number;
  user: UserBio | null;
  loading: boolean;
  error: string | null;
  fetchMyAgents: () => void;
}

const MyAgentsContext = createContext<MyAgentsContextType | undefined>(
  undefined
);

export const useMyAgents = () => {
  const context = useContext(MyAgentsContext);
  if (!context) {
    throw new Error("useMyAgents must be used within a MyAgentsProvider");
  }
  return context;
};

export const MyAgentsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [user, setUser] = useState<UserBio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { token, user: authUser } = useAuth();

  const fetchMyAgents = useCallback(async () => {
    if (!token || !authUser?.referral_code) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAllAgentsByReferral(
        token,
        authUser.referral_code
      );
      if (response.success && response.data) {
        setAgents(response.data.agents);
        setTotal(response.data.total);
        setUser(response.data.user);
      } else {
        setError(response.error || "Failed to fetch agents.");
      }
    } catch (err) {
      setError(`An unexpected error occurred - ${err}`);
    } finally {
      setLoading(false);
    }
  }, [token, authUser]);

  return (
    <MyAgentsContext.Provider
      value={{ agents, total, user, loading, error, fetchMyAgents }}
    >
      {children}
    </MyAgentsContext.Provider>
  );
};
