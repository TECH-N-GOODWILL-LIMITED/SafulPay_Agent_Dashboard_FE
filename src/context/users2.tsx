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
import type { Agent } from "../types/types";
import type { UserBio } from "../types/types";

interface UsersContextType {
  allUsers: UserBio[];
  allAgents: Agent[];
  filteredUsers: UserBio[];
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
  const [allUsers, setAllUsers] = useState<UserBio[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserBio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { token } = useAuth();

  const fetchUsers = async () => {
    if (!token) {
      setTitle("Not authenticated");
      setError("Refresh page...");
      setLoading(false);
      return;
    }

    const response = await getAllUsers(token);

    if (response.success && response.data) {
      setAllUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } else {
      setTitle("Failed to fetch users");
      setError(response.error || "Failed to fetch users");
    }
    setLoading(false);
  };

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
      // setFilteredUsers(response.data.users);
    } else {
      setTitle("Failed to fetch agents");
      setError(response.error || "Failed to fetch agents");
    }
    setLoading(false);
  };

  const filterByRole = useCallback(
    (role: string) => {
      const filtered = allUsers.filter((user) => user.role === role);
      setFilteredUsers(filtered);
    },
    [allUsers]
  );

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchAgents();
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
