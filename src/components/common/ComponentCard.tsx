import { useState, useCallback, useRef } from "react";
import Button from "../ui/button/Button";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ArrowDownIcon } from "../../icons";

// New interfaces to be added
export interface FilterConfig {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
  value: string;
}

export interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode | string;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export interface SearchConfig {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  debounceMs?: number;
}

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  defaultAction?: boolean;
  filters?: FilterConfig[];
  actionButton?: ActionButtonConfig;
  pagination?: PaginationConfig;
  searchConfig?: SearchConfig;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  defaultAction = false,
  pagination,
  filters = [],
  actionButton,
  searchConfig,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const getPaginationRange = (
    totalPages: number,
    currentPage: number,
    siblingCount = 1
  ) => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }
    return [];
  };

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="px-6 py-5 flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {actionButton && (
            <Button
              size="sm"
              endIcon={actionButton.icon || ""}
              onClick={actionButton.onClick}
            >
              {actionButton.label}
            </Button>
          )}

          {defaultAction && (
            <div className="relative">
              <Button size="sm" variant="outline" className="dropdown-toggle">
                View More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      {(filters.length > 0 || searchConfig) && (
        <>
          <div className="border-y border-gray-200 px-5 py-4 dark:border-gray-800">
            <div
              className={`flex gap-3 flex-wrap sm:${
                searchConfig ? "justify-between" : "justify-end"
              }`}
            >
              {searchConfig && (
                <div className="relative flex-1 sm:flex-auto self-baseline">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
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
                      ></path>
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder={searchConfig?.placeholder || "Search..."}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 min-w-[140px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden sm:max-w-[300px] sm:min-w-[200px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  />
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
                        onItemClick={() =>
                          handleSelect(filter.onSelect, option)
                        }
                        className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                      >
                        {option}
                      </DropdownItem>
                    ))}
                  </Dropdown>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>

      {/* PAGINATION */}
      {pagination && (
        <div
          className={`flex flex-col items-center justify-between border-t border-gray-200 px-5 py-4 sm:flex-row dark:border-gray-800 ${
            pagination.loading ? "opacity-50" : ""
          }`}
        >
          {/* Showing items info */}
          <div className="pb-3 sm:pb-0">
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              {pagination.loading
                ? "Loading..."
                : `Showing ${
                    (pagination.currentPage - 1) * pagination.perPage + 1
                  } to ${Math.min(
                    pagination.currentPage * pagination.perPage,
                    pagination.totalItems
                  )} of ${pagination.totalItems} results`}
            </span>
          </div>

          {/* Pagination controls */}
          <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-gray-50 p-4 sm:w-auto sm:justify-normal sm:rounded-none sm:bg-transparent sm:p-0 dark:bg-gray-900 dark:sm:bg-transparent">
            {/* Prev Button */}
            <Button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage === 1 || pagination.loading}
              variant="outline"
              className="sm:p-2.5 p-2 hover:bg-brand-500/[0.2]! hover:text-brand-500!"
            >
              {/* Left arrow SVG */}
              <div className="rotate-90">
                <ArrowDownIcon />
              </div>
            </Button>

            {/* Page numbers */}
            <span className="block text-sm font-medium text-gray-700 sm:hidden">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <ul className="hidden items-center gap-0.5 sm:flex">
              {getPaginationRange(
                pagination.totalPages,
                pagination.currentPage
              ).map((n, index) => (
                <li key={index}>
                  {n === "..." ? (
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
                      ...
                    </span>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!pagination.loading) {
                          pagination.onPageChange(n as number);
                        }
                      }}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                        pagination.currentPage === n
                          ? "bg-brand-500 text-white"
                          : "hover:bg-brand-500/[0.2] hover:text-brand-500 text-gray-700 dark:text-gray-400 hover:dark:bg-brand-700"
                      }`}
                    >
                      {n}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* Next Button */}
            <Button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={
                pagination.currentPage === pagination.totalPages ||
                pagination.loading
              }
              variant="outline"
              className="sm:p-2.5 p-2 hover:bg-brand-500/[0.2]! hover:text-brand-500!"
            >
              {/* Right arrow SVG */}
              <div className="-rotate-90">
                <ArrowDownIcon />
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentCard;
