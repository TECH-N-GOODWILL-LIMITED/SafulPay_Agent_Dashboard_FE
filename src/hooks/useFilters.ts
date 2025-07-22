import { useState, useCallback } from "react";

export type FilterType = {
  key: string;
  label: string;
  options: { value: string | number; label: string }[];
  multi?: boolean;
};

export type ActiveFilters = {
  [key: string]: string | number | (string | number)[];
};

export const useFilters = (initialFilters: FilterType[]) => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

  const setFilter = useCallback(
    (key: string, value: string | number | (string | number)[]) => {
      setActiveFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const clearFilter = useCallback((key: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const isFilterActive = useCallback(
    (key: string, value: string | number) => {
      const filterValue = activeFilters[key];
      if (Array.isArray(filterValue)) {
        return filterValue.includes(value);
      }
      return filterValue === value;
    },
    [activeFilters]
  );

  return {
    activeFilters,
    setFilter,
    clearFilter,
    clearAllFilters,
    isFilterActive,
    filters: initialFilters,
  };
};
