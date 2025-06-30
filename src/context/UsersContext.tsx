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
import type { Agent, Users } from "../types/types";
// import type { UserBio } from "../types/types";

interface AgentWithRole extends Agent {
  role: string; // set to "Agent"
}

export type usersItem = Users | AgentWithRole;

interface UsersContextType {
  // allUsers: UserBio[];
  // filteredUsers: UserBio[];
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
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

export const UsersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  //   const [userError, setUserError] = useState<string | null>(null);
  //   const [agentError, setAgentError] = useState<string | null>(null);
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
      setAllAgents(response.data.agents);
    } else {
      setTitle("Failed to fetch agents");
      setError(response.error || "Failed to fetch agents");
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
      const combined = [
        ...userRes.data.users,
        ...agentRes.data.agents.map((agent) => ({
          ...agent,
          role: agent.type,
        })),
      ];

      setAllUsers(combined);
      setFilteredUsers(combined);

      setError("");
    } else {
      // Handle errors separately
      if (!userRes.success && !agentRes.success) {
        setTitle("ERROR !!!");
        setError("Failed to fetch users and agents");
      } else if (!userRes.success) {
        setTitle("Failed to fetch users");
        setError(userRes.error || "Failed to fetch users");
      } else if (!agentRes.success) {
        setTitle("Failed to fetch agents");
        setError(agentRes.error || "Failed to fetch agents");
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
