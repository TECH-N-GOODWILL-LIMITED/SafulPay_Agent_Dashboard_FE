import { useState } from "react";
import Button from "../ui/button/Button";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

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
interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  defaultAction?: boolean;
  filters?: FilterConfig[];
  actionButton?: ActionButtonConfig;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  defaultAction = false,
  filters = [],
  actionButton,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
          {filters.length > 0 && (
            <span className="font-semibold leading-6 text-gray-500 dark:text-gray-400">
              Filter By -
            </span>
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
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
