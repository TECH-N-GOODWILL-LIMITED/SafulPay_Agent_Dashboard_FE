import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { getAllUsers, type GetAllUsersParams } from "../utils/api";
import type { AllUsersData } from "../types/types";
import { ADMIN_ROLE } from "../utils/roles";

interface UsersContextType {
  allUsers: AllUsersData | null;
  fetchUsers: (params: GetAllUsersParams) => Promise<void>;
  totalUsers: number;
  title: string;
  error?: string;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) throw new Error("useUsers must be used within UsersProvider");
  return context;
};

export const UsersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allUsers, setAllUsers] = useState<AllUsersData | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { user, token } = useAuth();

  const fetchUsers = useCallback(
    async (params: GetAllUsersParams) => {
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

      const response = await getAllUsers(token, params);

      if (response.success && response.data) {
        setAllUsers(response.data);
        setTotalUsers(response.data.total_all_users);
        setError("");
      } else {
        setTitle("Failed to fetch users");
        setError(response.error || "Failed to fetch users");
      }
      setLoading(false);
    },
    [token, user]
  );

  useEffect(() => {
    if (token && user?.role === ADMIN_ROLE) {
      fetchUsers({ page: 1, per_page: 10 });
    }
  }, [token, user, fetchUsers]);

  return (
    <UsersContext.Provider
      value={{
        allUsers,
        totalUsers,
        fetchUsers,
        title,
        error,
        loading,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
