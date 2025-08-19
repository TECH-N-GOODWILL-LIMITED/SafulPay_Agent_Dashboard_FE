import type { usersMetric } from "../../types/types";
import { DollarLineIcon, GroupIcon } from "../../icons";
// import Badge from "../ui/badge/Badge";

interface EcommerceMetricsProps {
  data: usersMetric;
  type?: string;
  loading?: boolean;
}

export default function EcommerceMetrics({
  data,
  type = "user",
  loading = false,
}: EcommerceMetricsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {type !== "cash" ? (
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        ) : (
          <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />
        )}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {data.users}
          </span>

          {loading ? (
            <div className="mt-2 h-8 w-10 bg-gray-200 dark:bg-gray-700 self-end rounded animate-pulse">
            </div>
          ) : (
            <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              {data.currencySymbol ? `Le ${data.metric} ` : data.metric}
            </h4>
          )}
        </div>
        {/* {data.amount && (
          <div className="flex items-end justify-between mt-5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {data.users}
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data.metric}
            </h4>
          </div>
        )} */}

        {/* <Badge color="success">
          <ArrowUpIcon />
          11.01%
        </Badge> */}
      </div>
    </div>
  );
}
