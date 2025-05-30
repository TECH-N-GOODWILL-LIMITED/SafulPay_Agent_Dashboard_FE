import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { getAllUsers } from "../utils/api";
import { UserBio } from "../types/types";

interface UsersContextType {
  allUsers: UserBio[];
  filteredUsers: UserBio[];
  fetchUsers: () => Promise<void>;
  filterByRole: (role: string) => void;
  error?: string;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const useAllUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

export const UsersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [allUsers, setAllUsers] = useState<UserBio[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserBio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const { token } = useAuth();

  const fetchUsers = async () => {
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const response = await getAllUsers(token);
    if (response.success && response.data) {
      setAllUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } else {
      setError(response.error || "Failed to fetch users");
    }
    setLoading(false);
  };

  const filterByRole = (role: string) => {
    const filtered = allUsers.filter((user) => user.role === role);
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  return (
    <UsersContext.Provider
      value={{
        allUsers,
        filteredUsers,
        fetchUsers,
        filterByRole,
        error,
        loading,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
