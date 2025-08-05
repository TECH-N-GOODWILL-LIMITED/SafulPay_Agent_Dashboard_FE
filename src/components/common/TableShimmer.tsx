import React from "react";

interface TableShimmerProps {
  rows?: number;
  columns?: number;
  showAvatar?: boolean;
  showAction?: boolean;
}

const TableShimmer: React.FC<TableShimmerProps> = ({
  rows = 5,
  columns = 6,
  showAvatar = true,
  showAction = true,
}) => {
  return (
    <div className="animate-pulse">
      {/* Header Shimmer */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-5 py-2">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="flex-1 px-4 py-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          ))}
          {showAction && (
            <div className="px-4 py-1 w-20">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          )}
        </div>
      </div>

      {/* Body Shimmer */}
      <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center px-5 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-2 py-1">
                {colIndex === 0 && showAvatar ? (
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ) : colIndex === columns - 1 ? (
                  // Status column
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                ) : (
                  // Regular column
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                )}
              </div>
            ))}
            {showAction && (
              <div className="px-4 py-1 w-20">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableShimmer;
