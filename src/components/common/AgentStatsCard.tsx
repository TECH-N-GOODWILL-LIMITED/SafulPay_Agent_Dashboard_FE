import { useEffect, useState } from "react";
import { Agent, MarketerStats } from "../../types/types";
import Badge from "../ui/badge/Badge";
import { getMarketersStats } from "../../utils/api";
import Alert from "../ui/alert/Alert";

interface StatsProp {
  statsData: Agent[];
}

const AgentsStatsCard: React.FC<StatsProp> = ({ statsData }) => {
  const [tableData, setTableData] = useState<MarketerStats | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getMarketersStats();
      if (response.success && response.data) {
        setTableData(response.data);
      } else {
        setAlertTitle("Error");
        setError(response.error || "Failed to fetch data");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const totalAgents = tableData?.total_agents;
  const totalReferred = statsData.length;
  const activeAgents = statsData.filter((agent) => agent.status === 1).length;
  const pendingAgents = statsData.filter((agent) => agent.status === 0).length;
  const incompleteKyc = statsData.filter((agent) => agent.temp === 0).length;
  const completedKyc = statsData.filter((agent) => agent.temp === 1).length;
  const totalResiduals = statsData.reduce(
    (acc, agent) => acc + (agent.residual_amount || 0),
    0
  );

  const referredPercentage = totalAgents
    ? (totalReferred / totalAgents) * 100
    : 0;

  //   const activePercentage = totalReferred
  //     ? (activeAgents / totalReferred) * 100
  //     : 0;

  //   const pendingPercentage = totalReferred
  //     ? (pendingAgents / totalReferred) * 100
  //     : 0;

  //   const completedKycPercentage = totalReferred
  //     ? (completedKyc / totalReferred) * 100
  //     : 0;

  if (error)
    return (
      <Alert
        variant="error"
        title={alertTitle}
        message={error}
        showLink={false}
      />
    );

  if (loading)
    return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Overview
          </h3>
        </div>
      </div>
      <div className="grid rounded-2xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Referred by You / Total Agents
          </span>
          <div className="mt-2 flex items-end justify-between gap-1">
            <h4 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
              {totalReferred} /
              <span className="text-theme-xl font-medium">{totalAgents}</span>
            </h4>
            <div className="flex items-end gap-1">
              {referredPercentage > 0 && (
                <Badge>{`${referredPercentage.toFixed(1)}%`}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 xl:border-r xl:border-b-0 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Active Agents / Pending Agents
          </span>
          <div className="mt-2 flex items-end justify-between gap-1">
            <h4 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
              {activeAgents} /
              <span className="text-theme-xl font-medium">{pendingAgents}</span>
            </h4>
            {/* <div className="flex items-end gap-1">
              {activePercentage > 0 && (
                <Badge color="success">{`${activePercentage.toFixed(
                  1
                )}%`}</Badge>
              )}

              <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                active Vs referred
              </span>
            </div> */}
          </div>
        </div>
        <div className="border-b border-gray-200 px-6 py-5 sm:border-r sm:border-b-0 dark:border-gray-800">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Incomplete KYC / Completed KYC
            </span>
            <div className="mt-2 flex items-end justify-between gap-1">
              <h4 className="text-title-sm font-semibold text-gray-800 dark:text-white/90 grow">
                {incompleteKyc} /
                <span className="text-theme-xl font-medium">
                  {completedKyc}
                </span>
              </h4>
              <div className="flex items-end gap-0.5 shrink">
                {/* {completedKycPercentage > 0 && (
                  <Badge color="success">{`${completedKycPercentage.toFixed(
                    1
                  )}%`}</Badge>
                )} */}
                {/* <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                  complete KYC Vs referred
                </span> */}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Residual Cash
          </span>
          <div className="mt-2 flex items-end gap-3">
            <h4 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
              Le {totalResiduals.toFixed(2)}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsStatsCard;
