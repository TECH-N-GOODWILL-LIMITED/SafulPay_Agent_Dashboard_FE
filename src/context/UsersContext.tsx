import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { getAllUsers } from "../utils/api";
import type { Users } from "../types/types";
import { ADMIN_ROLE } from "../utils/roles";

interface UsersContextType {
  allUsers: Users[];
  filteredUsers: Users[];
  fetchUsers: () => Promise<void>;
  filterByRole: (role: string | string[]) => void;
  title: string;
  error?: string;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};

export const UsersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allUsers, setAllUsers] = useState<Users[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { user, token } = useAuth();

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

    const userRes = await getAllUsers(token);

    if (userRes.success && userRes.data) {
      setAllUsers(userRes.data.users);
      setFilteredUsers(userRes.data.users);
      setError("");
    } else {
      setTitle("Failed to fetch users");
      setError(userRes.error || "Failed to fetch users");
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
        filteredUsers,
        fetchUsers,
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
