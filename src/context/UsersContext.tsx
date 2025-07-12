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
import { ADMIN_ROLE } from "../utils/roles";

interface AgentWithRole extends Agent {
  role: string;
}

export type usersItem = Users | AgentWithRole;

interface UsersContextType {
  allAgents: Agent[];
  allUsers: usersItem[];
  filteredUsers: usersItem[];
  fetchUsers: () => Promise<void>;
  fetchAgents: () => Promise<void>;
  filterByRole: (role: string | string[]) => void;
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
  const [allUsers, setAllUsers] = useState<usersItem[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<usersItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { user, token } = useAuth();

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

    if (user?.role !== ADMIN_ROLE) {
      setTitle("Unauthorized");
      setError("You do not have permission to view this data.");
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
    (role: string | string[]) => {
      if (role === "All Users") return setFilteredUsers(allUsers);

      const rolesToFilter = Array.isArray(role) ? role : [role];
      const filtered = allUsers.filter((user) =>
        rolesToFilter.includes(user.role)
      );
      setFilteredUsers(filtered);
    },
    [allUsers]
  );

  useEffect(() => {
    if (token && user?.role === ADMIN_ROLE) {
      fetchUsers();
    }
  }, [token, user]);

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
