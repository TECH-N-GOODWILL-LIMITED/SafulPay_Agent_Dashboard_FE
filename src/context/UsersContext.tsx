import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { getAllUsers, getAllAgents } from "../utils/api";
import type { Agent, UserBio } from "../types/types";
import { Role } from "../types/types";

export type usersItem = UserBio | Agent;

interface UsersContextType {
  allAgents: Agent[];
  allUsers: usersItem[];
  filteredUsers: usersItem[];
  fetchUsers: () => Promise<void>;
  fetchAgents: () => Promise<void>;
  filterByRole: (role: string) => void;
  title: string;
  error?: string;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const useAllUsers = () => {
  const context = useContext(UsersContext);
  if (!context)
    throw new Error("useAllUsers must be used within UsersProvider");
  return context;
};

export const UsersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allUsers, setAllUsers] = useState<usersItem[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<usersItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { token } = useAuth();

  const fetchAgents = async () => {
    if (!token) {
      setTitle("Not authenticated");
      setError("Refresh page...");
      setLoading(false);
      return;
    }

    const response = await getAllAgents(token);
    if (response.success && response.data) {
      const agentsWithRole = response.data.agents.map((agent) => ({
        ...agent,
        role: Role.Agent,
      }));
      setAllAgents(agentsWithRole);
    } else {
      setTitle("Failed to fetch agents");
      setError(
        typeof response.error === "string"
          ? response.error
          : response.error?.message || "Failed to fetch agents"
      );
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    if (!token) {
      setTitle("Not authenticated");
      setError("Refresh page...");
      setLoading(false);
      return;
    }

    const [userRes, agentRes] = await Promise.all([
      getAllUsers(token),
      getAllAgents(token),
    ]);

    if (userRes.success && userRes.data && agentRes.success && agentRes.data) {
      const agentUsers = agentRes.data.agents.map((agent) => ({
        ...agent,
        role: Role.Agent, // ✅ use enum, not raw string
      }));

      const combined: usersItem[] = [...userRes.data.users, ...agentUsers];

      setAllUsers(combined);
      setFilteredUsers(combined);
      setError("");
    } else {
      if (!userRes.success && !agentRes.success) {
        setTitle("ERROR !!!");
        setError("Failed to fetch users and agents");
      } else if (!userRes.success) {
        setTitle("Failed to fetch users");
        setError(
          typeof userRes.error === "string"
            ? userRes.error
            : userRes.error?.message || "Failed to fetch users"
        );
      } else if (!agentRes.success) {
        setTitle("Failed to fetch agents");
        setError(
          typeof agentRes.error === "string"
            ? agentRes.error
            : agentRes.error?.message || "Failed to fetch agents"
        );
      }
    }
    setLoading(false);
  };

  const filterByRole = useCallback(
    (role: string) => {
      if (role === "All Users") return setFilteredUsers(allUsers);
      const filtered = allUsers.filter((user) => user.role === role);
      setFilteredUsers(filtered);
    },
    [allUsers]
  );

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <UsersContext.Provider
      value={{
        allUsers,
        allAgents,
        filteredUsers,
        fetchUsers,
        fetchAgents,
        filterByRole,
        title,
        error,
        loading,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
