import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllVendors } from "../utils/api";
import type { Vendor } from "../types/types";

interface UseVendorsReturn {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useVendors = (): UseVendorsReturn => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { coreApiToken } = useAuth();

  const fetchVendors = async () => {
    if (!coreApiToken) {
      setError("Technical errro: Authentication required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAllVendors(coreApiToken);

      if (response.success && response.data) {
        setVendors(response.data.vendors);
      } else {
        setError(response.error || "Failed to fetch vendors");
      }
    } catch (err) {
      setError(`Error fetching vendors: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coreApiToken) {
      fetchVendors();
    }
  }, [coreApiToken]);

  return {
    vendors,
    loading,
    error,
    refetch: fetchVendors,
  };
};
