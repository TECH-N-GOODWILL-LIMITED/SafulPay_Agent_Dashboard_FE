import { useState } from "react";
import Button from "../ui/button/Button";
import { MarketerStats } from "../../types/types";
import Badge from "../ui/badge/Badge";

interface StatsProp {
  statsData: MarketerStats | undefined;
}

const StatsCard: React.FC<StatsProp> = ({ statsData }) => {
  const [selected, setSelected] = useState("weekly");

  let percentageReffered = 0;

  if (statsData?.total_agents_by_marketers) {
    percentageReffered =
      (statsData?.total_agents_by_marketers / statsData?.total_agents) * 100;
  }

  const agentsThisWeek = statsData?.total_agents_per_week[0]?.total_agents || 0;
  const agentsLastWeek = statsData?.total_agents_per_week[1]?.total_agents || 0;
  const totalAgents = statsData?.total_agents || 0;
  const totalAgentsAsOfLastWeek = totalAgents - agentsThisWeek;

  let totalAgentsPercentageIncrease = 0;
  if (totalAgentsAsOfLastWeek > 0) {
    totalAgentsPercentageIncrease =
      (agentsThisWeek / totalAgentsAsOfLastWeek) * 100;
  } else if (agentsThisWeek > 0) {
    totalAgentsPercentageIncrease = 100;
  }

  let vsLastWeekPercentageChange = 0;
  if (agentsLastWeek > 0) {
    vsLastWeekPercentageChange =
      ((agentsThisWeek - agentsLastWeek) / agentsLastWeek) * 100;
  } else if (agentsThisWeek > 0) {
    vsLastWeekPercentageChange = 100;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Overview
          </h3>
        </div>

        <div className="flex gap-x-3.5">
          {/* Toggle Buttons */}
          <div className="inline-flex w-full items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            {["weekly", "monthly", "yearly"].map((option) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`w-full rounded-md px-3 py-2 text-sm font-medium hover:text-gray-900 dark:hover:text-white shadow-xs ${
                  selected === option
                    ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          {/* Filter Button */}
          <div>
            <Button
              // onClick={toggleDropdown}
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
              Filter
            </Button>
          </div>
        </div>
      </div>
      <div className="grid rounded-2xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Agents
          </span>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {statsData?.total_agents}
            </h4>
            <div className="flex items-end gap-1">
              <Badge
                color={
                  totalAgentsPercentageIncrease > 0
                    ? "success"
                    : totalAgentsPercentageIncrease < 0
                    ? "error"
                    : "primary"
                }
              >
                {totalAgentsPercentageIncrease > 0 ? "+" : ""}
                {`${totalAgentsPercentageIncrease.toFixed(1)}%`}
              </Badge>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                Vs total last week
              </span>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 xl:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Registered by Marketers
          </span>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {statsData?.total_agents_by_marketers}
            </h4>
            <div className="flex items-end gap-1">
              <Badge>{`${percentageReffered.toFixed(1)}%`}</Badge>
              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                of total agents
              </span>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r sm:border-b-0 dark:border-gray-800">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Agents this week
            </span>
            <div className="mt-2 flex items-end justify-between gap-3">
              <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
                {statsData?.total_agents_per_week[0]?.total_agents || 0}
              </h4>
              <div className="flex items-end gap-1">
                <Badge
                  color={
                    vsLastWeekPercentageChange > 0
                      ? "success"
                      : vsLastWeekPercentageChange < 0
                      ? "error"
                      : "primary"
                  }
                >
                  {vsLastWeekPercentageChange > 0 ? "+" : ""}
                  {`${vsLastWeekPercentageChange.toFixed(1)}%`}
                </Badge>
                <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                  Vs last week
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Agents last week
          </span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-xs sm:text-title-sm font-bold text-gray-800 dark:text-white/90">
              {statsData?.total_agents_per_week[1]?.total_agents || 0}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
