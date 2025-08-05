import { useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAllMarketers } from "../../context/MarketersContext";
import { useMyAgents } from "../../context/MyAgentsContext";
import BarChartDynamic from "../charts/bar/BarChartDynamic";
import ComponentCard, { ActionButtonConfig } from "../common/ComponentCard";
import {
  AGENT_ROLE,
  MARKETER_ROLE,
  MERCHANT_ROLE,
  SUPER_AGENT_ROLE,
} from "../../utils/roles";

const MarketerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const {
    allMarketers,
    marketerStats,
    fetchMarketers,
    fetchMarketerStats,
    // loading: marketersLoading,
    // error: marketersError,
  } = useAllMarketers();
  const {
    agents,
    total,
    // user: myUser,
    loading: agentsLoading,
    error: agentsError,
    fetchMyAgents,
  } = useMyAgents();

  useEffect(() => {
    if (token && user?.role === MARKETER_ROLE) {
      fetchMarketers();
      fetchMyAgents();
    }
    fetchMarketerStats();
  }, [token, user]);

  const handleRefresh = () => {
    if (token && user?.role === MARKETER_ROLE) {
      fetchMarketers();
      fetchMyAgents();
    }
    fetchMarketerStats();
  };

  const refreshButton: ActionButtonConfig = {
    label: "Refresh",
    onClick: handleRefresh,
  };

  // Derived data for agent filtering
  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.status === 1),
    [agents]
  );
  const inactiveAgents = useMemo(
    () => agents.filter((agent) => agent.status === 0 || agent.status === 2),
    [agents]
  );
  const rejectedApprovals = useMemo(
    () => agents.filter((agent) => agent.status === 3),
    [agents]
  );
  const completedKYC = useMemo(
    () => agents.filter((agent) => agent.temp === 1),
    [agents]
  );
  const incompleteKYC = useMemo(
    () => agents.filter((agent) => agent.temp !== 1),
    [agents]
  );
  // Assuming mySuperAgent and myMerchant are properties or can be derived similarly
  const mySuperAgents = useMemo(
    () => agents.filter((agent) => agent.type === SUPER_AGENT_ROLE),
    [agents]
  );
  const myAgents = useMemo(
    () => agents.filter((agent) => agent.type === AGENT_ROLE),
    [agents]
  );
  const myMerchants = useMemo(
    () => agents.filter((agent) => agent.type === MERCHANT_ROLE),
    [agents]
  );

  // Chart data for regional distribution
  const getRegionalDistribution = () => {
    const distribution: { [key: string]: number } = {};
    agents.forEach((agent) => {
      if (agent.region) {
        distribution[agent.region] = (distribution[agent.region] || 0) + 1;
      }
    });
    return distribution;
  };

  const regionalDistribution = getRegionalDistribution();

  const chartOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar" as const,
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end" as const,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: Object.keys(regionalDistribution),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top" as const,
      horizontalAlign: "center" as const,
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Agents by Region",
      data: Object.values(regionalDistribution),
    },
  ];

  return (
    <div className="space-y-6">
      <ComponentCard title="Marketer Overview" actionButton={refreshButton}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded shadow">
            <h4>Total Marketers</h4>
            <p>{allMarketers?.total_marketers ?? 0}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>Total Agents</h4>
            <p>{marketerStats?.total_agents ?? 0}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>Agents by Marketers</h4>
            <p>{marketerStats?.total_agents_by_marketers ?? 0}</p>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="My Agent Network" actionButton={refreshButton}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded shadow">
            <h4>Total Agents Referred</h4>
            <p>{total}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>Active Agents</h4>
            <p>{activeAgents.length}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>Inactive Agents</h4>
            <p>{inactiveAgents.length}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>Rejected Approvals</h4>
            <p>{rejectedApprovals.length}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>Completed KYC</h4>
            <p>{completedKYC.length}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>Incomplete KYC</h4>
            <p>{incompleteKYC.length}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>My Agents</h4>
            <p>{myAgents.length}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>My Super Agents</h4>
            <p>{mySuperAgents.length}</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h4>My Merchants</h4>
            <p>{myMerchants.length}</p>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Regional Distribution of My Agents">
        {agentsLoading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        ) : agentsError ? (
          <div className="text-red-500">{agentsError}</div>
        ) : (
          <BarChartDynamic options={chartOptions} series={chartSeries} />
        )}
      </ComponentCard>
    </div>
  );
};

export default MarketerDashboard;
