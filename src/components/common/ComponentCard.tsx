import { useState } from "react";
import Button from "../ui/button/Button";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { CloseIcon, DownloadIcon, ChevronDownIcon } from "../../icons";

// Simplified interfaces
export interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode | string;
}

export interface DownloadButtonConfig {
  label: string;
  onDownload: (format: "csv" | "excel") => Promise<void>;
  disabled?: boolean;
}

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  actionButton?: ActionButtonConfig;
  downloadButton?: DownloadButtonConfig;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  actionButton,
  downloadButton,
}) => {
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>("");

  const handleDownload = async (format: "csv" | "excel") => {
    if (downloadLoading || downloadButton?.disabled) return;

    setDownloadLoading(true);
    setDownloadError("");
    setShowDownloadDropdown(false);

    try {
      await downloadButton?.onDownload(format);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadLoading(false);
    }
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
          {downloadButton && (
            <div className="relative">
              <Button
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                disabled={downloadLoading || downloadButton.disabled}
                className="dropdown-toggle"
                variant="outline"
                size="sm"
              >
                {downloadLoading ? "Downloading..." : downloadButton.label}
                <ChevronDownIcon className="size-4.5" />
              </Button>

              <Dropdown
                isOpen={showDownloadDropdown}
                onClose={() => setShowDownloadDropdown(false)}
                className="w-50 p-2"
              >
                <DropdownItem
                  onClick={() => handleDownload("csv")}
                  className="flex items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <DownloadIcon className="size-5" />
                  Download as CSV
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleDownload("excel")}
                  className="flex items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <DownloadIcon className="size-5" />
                  Download as Excel
                </DropdownItem>
              </Dropdown>
            </div>
          )}
          {actionButton && (
            <Button
              size="sm"
              startIcon={
                actionButton.icon || <CloseIcon className="w-4 h-4 rotate-45" />
              }
              onClick={actionButton.onClick}
            >
              {actionButton.label}
            </Button>
          )}
        </div>

        {downloadError && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {downloadError}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
