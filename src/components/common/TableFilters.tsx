import { useState, useCallback, useRef, useEffect } from "react";
import Button from "../ui/button/Button";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import DatePicker from "../form/date-picker";
import { getUserByReferralCode } from "../../utils/api";

export interface FilterConfig {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
  value: string;
}

export interface SearchConfig {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  debounceMs?: number;
}

export interface DateFilterConfig {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export interface ReferralFilterConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  token?: string;
}

export interface PerformedByFilterConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface TableFiltersProps {
  filters?: FilterConfig[];
  searchConfig?: SearchConfig;
  dateFilter?: DateFilterConfig;
  referralFilter?: ReferralFilterConfig;
  performedByFilter?: PerformedByFilterConfig;
  dateError?: string;
  startDateError?: string;
  endDateError?: string;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  filters = [],
  searchConfig,
  dateFilter,
  referralFilter,
  performedByFilter,
  dateError,
  startDateError,
  endDateError,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [referralValidation, setReferralValidation] = useState<{
    loading: boolean;
    valid: boolean;
    userName?: string;
    error?: string;
  }>({ loading: false, valid: false });

  const toggleDropdown = (label: string) => {
    if (openDropdown === label) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(label);
    }
  };

  const handleSelect = (onSelect: (option: string) => void, option: string) => {
    onSelect(option);
    setOpenDropdown(null);
  };

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        if (searchConfig?.onSearch) {
          searchConfig.onSearch(value);
        }
      }, searchConfig?.debounceMs || 500);
    },
    [searchConfig]
  );

  // Referral validation effect
  useEffect(() => {
    if (!referralFilter?.value || !referralFilter?.token) {
      setReferralValidation({ loading: false, valid: false });
      return;
    }

    const validateReferral = async () => {
      setReferralValidation({ loading: true, valid: false });

      try {
        const response = await getUserByReferralCode(
          referralFilter.value.toUpperCase()
        );
        if (response.success && response.data?.user?.name) {
          setReferralValidation({
            loading: false,
            valid: true,
            userName: response.data.user.name,
          });
        } else {
          setReferralValidation({
            loading: false,
            valid: false,
            error: "Invalid referral code",
          });
        }
      } catch {
        setReferralValidation({
          loading: false,
          valid: false,
          error: "Invalid referral code",
        });
      }
    };

    const timeoutId = setTimeout(validateReferral, 500);
    return () => clearTimeout(timeoutId);
  }, [referralFilter?.value, referralFilter?.token]);

  const activeFiltersCount = [
    dateFilter,
    referralFilter,
    performedByFilter,
  ].filter(Boolean).length;

  if (filters.length === 0 && !searchConfig && activeFiltersCount === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 px-5 pb-4 dark:border-gray-800">
      <div
        className={`flex gap-3 flex-wrap sm:${
          searchConfig ? "justify-between" : "justify-end"
        }`}
      >
        {searchConfig && (
          <div className="relative flex-1 sm:flex-auto self-baseline">
            <Input
              type="text"
              placeholder={searchConfig?.placeholder || "Search..."}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="min-w-[140px] sm:max-w-[300px] sm:min-w-[200px] pl-10"
            />
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                  fill=""
                />
              </svg>
            </span>
          </div>
        )}

        {filters.map((filter) => (
          <div className="relative" key={filter.label}>
            <Button
              onClick={() => toggleDropdown(filter.label)}
              size="sm"
              variant="outline"
              className="dropdown-toggle"
            >
              <svg
                className="stroke-current fill-white dark:fill-gray-800"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.29004 5.90393H17.7067"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.7075 14.0961H2.29085"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                  fill=""
                  stroke=""
                  strokeWidth="1.5"
                />
                <path
                  d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                  fill=""
                  stroke=""
                  strokeWidth="1.5"
                />
              </svg>
              {filter.label}
            </Button>
            <Dropdown
              isOpen={openDropdown === filter.label}
              onClose={() => setOpenDropdown(null)}
              className="w-40 p-2"
            >
              {filter.options.map((option) => (
                <DropdownItem
                  key={option}
                  onItemClick={() => handleSelect(filter.onSelect, option)}
                  className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  {option}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        ))}
      </div>

      {/* Date, Referral, and Performed By Filters */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <div
            className={`grid gap-4 grid-cols-1 ${
              activeFiltersCount > 1 ? "w-154 sm:grid-cols-2" : "w-75"
            } `}
          >
            {referralFilter && (
              <div>
                <Label>Referred By</Label>
                <Input
                  type="text"
                  value={referralFilter.value}
                  onChange={(e) => referralFilter.onChange(e.target.value)}
                  placeholder={
                    referralFilter.placeholder || "Enter referral code"
                  }
                  hint={
                    referralValidation.loading
                      ? "Validating..."
                      : referralValidation.valid
                      ? `Valid: ${referralValidation.userName}`
                      : referralValidation.error
                  }
                  success={referralValidation.valid}
                  error={
                    !referralValidation.valid && !!referralValidation.error
                  }
                />
              </div>
            )}
            {performedByFilter && (
              <div>
                <Label>Performed By</Label>
                <Input
                  type="text"
                  value={performedByFilter.value}
                  onChange={(e) => performedByFilter.onChange(e.target.value)}
                  placeholder={
                    performedByFilter.placeholder || "Enter performed by name"
                  }
                />
              </div>
            )}
            {dateFilter && (
              <div>
                <DatePicker
                  label="Date Range"
                  id="date-range-picker"
                  mode="range"
                  placeholder="Select date range..."
                  maxDate={new Date()}
                  error={!!startDateError || !!endDateError || !!dateError}
                  hint={startDateError || endDateError || dateError}
                  value={
                    dateFilter.startDate && dateFilter.endDate
                      ? `${dateFilter.startDate} to ${dateFilter.endDate}`
                      : ""
                  }
                  onChange={(dates) => {
                    // In range mode, flatpickr provides 2 dates once the range is selected.
                    if (dates.length === 2) {
                      const startDate = dates[0].toISOString().split("T")[0];
                      const endDate = dates[1].toISOString().split("T")[0];
                      dateFilter.onDateRangeChange(startDate, endDate);
                    } else if (dates.length === 0) {
                      // This handles clearing the date picker
                      dateFilter.onDateRangeChange("", "");
                    }
                    // If dates.length is 1, do nothing, wait for the user to select the second date.
                  }}
                  onClear={() => dateFilter.onDateRangeChange("", "")}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilters;
