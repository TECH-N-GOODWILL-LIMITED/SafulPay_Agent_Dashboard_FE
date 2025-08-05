import Button from "../ui/button/Button";
import { ArrowDownIcon } from "../../icons";

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

interface TablePaginationProps {
  pagination: PaginationConfig;
}

const TablePagination: React.FC<TablePaginationProps> = ({ pagination }) => {
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
      className={`flex flex-col items-center justify-between border-t border-gray-200 px-5 py-4 sm:flex-row dark:border-gray-800 ${
        pagination.loading ? "opacity-50" : ""
      }`}
    >
      {/* Showing items info */}
      <div className="pb-3 sm:pb-0">
        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
          {pagination.loading
            ? "Loading..."
            : `Showing 
            ${
              pagination.totalItems &&
              `${(pagination.currentPage - 1) * pagination.perPage + 1} 
                to ${Math.min(
                  pagination.currentPage * pagination.perPage,
                  pagination.totalItems
                )}`
            }
              
              of ${pagination.totalItems} results`}
        </span>
      </div>

      {/* Pagination controls */}
      <div className="flex w-full items-center justify-between gap-2 rounded-lg bg-gray-50 p-4 sm:w-auto sm:justify-normal sm:rounded-none sm:bg-transparent sm:p-0 dark:bg-gray-900 dark:sm:bg-transparent">
        {/* Prev Button */}
        <Button
          onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
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
          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
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
  );
};

export default TablePagination;
