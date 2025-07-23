import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { BasicMarketerInfo } from "../../../types/types";
import Badge from "../../ui/badge/Badge";

interface Order {
  tableHeading?: string[];
  tableContent: BasicMarketerInfo[] | undefined;
}

const LeaderboardTable: React.FC<Order> = ({ tableContent, tableHeading }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {tableHeading?.map((head) => (
                <TableCell
                  key={head}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableContent && tableContent.length !== 0 ? (
              tableContent.map((item) => {
                const thisWeekAgents =
                  item.weekly_agents[0].agents_this_week || 0;
                const lastWeekAgents =
                  item.weekly_agents[1].agents_this_week || 0;
                const currentTotal = item.total_agents || 0;
                const previousTotal = currentTotal - thisWeekAgents;

                let totalDiffPercent = 0;
                if (previousTotal > 0) {
                  totalDiffPercent = (thisWeekAgents / previousTotal) * 100;
                } else if (thisWeekAgents > 0) {
                  totalDiffPercent = 100;
                }

                let weeklyDiffPercent = 0;
                if (lastWeekAgents > 0) {
                  weeklyDiffPercent =
                    ((thisWeekAgents - lastWeekAgents) / lastWeekAgents) * 100;
                } else if (thisWeekAgents > 0) {
                  weeklyDiffPercent = 100;
                }

                const showTotalBadge = totalDiffPercent !== 0;
                const showWeeklyBadge = weeklyDiffPercent !== 0;
                return (
                  <TableRow key={item.marketer_id}>
                    {/* User info */}
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        {/* Placeholder for user image if available */}
                        <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                          {/* Replace with actual image if available */}
                          <span className="text-gray-500">👤</span>
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {`${item.firstname} ${item.lastname}`}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {item.username}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Referral code */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {item.referral_code}
                    </TableCell>

                    {/* Total referred agents */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex items-end gap-4">
                        {item.total_agents}

                        {showTotalBadge && (
                          <Badge
                            size="sm"
                            color={
                              totalDiffPercent > 0
                                ? "success"
                                : totalDiffPercent < 0
                                ? "error"
                                : "primary"
                            }
                          >
                            {totalDiffPercent > 0
                              ? `+${totalDiffPercent.toFixed(1)}%`
                              : totalDiffPercent < 0
                              ? `${totalDiffPercent.toFixed(1)}%`
                              : `0%`}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Last week referred agents */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex items-end gap-4">
                        {item.weekly_agents[1].agents_this_week}
                      </div>
                    </TableCell>

                    {/* This week referred agents */}
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex items-end gap-4">
                        {item.weekly_agents[0].agents_this_week}

                        {showWeeklyBadge && (
                          <Badge
                            size="sm"
                            color={
                              weeklyDiffPercent > 0
                                ? "success"
                                : weeklyDiffPercent < 0
                                ? "error"
                                : "primary"
                            }
                          >
                            {weeklyDiffPercent > 0
                              ? `+${weeklyDiffPercent.toFixed(1)}%`
                              : weeklyDiffPercent < 0
                              ? `${weeklyDiffPercent.toFixed(1)}%`
                              : `0%`}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  No Data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
