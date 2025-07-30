import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { useUsers } from "../../context/UsersContext";
import { useAuth } from "../../context/AuthContext";
import { generateUserMetrics } from "../../utils/utils";
import type { usersMetric } from "../../types/types";
import MarketerDashboard from "../../components/Dashboard/MarketerDashboard";
import { GroupIcon } from "../../icons";
import { useAgents } from "../../context/AgentsContext";

const usersCashFLow: usersMetric[] = [
  { users: "Total Cumulative Cash", metric: 120000, currencySymbol: true },
  {
    users: "Cumulative Cash with Agents",
    metric: 103000,
    currencySymbol: true,
  },
  {
    users: "Cumulative Cash with Accountants",
    metric: 24000,
    currencySymbol: true,
  },
  {
    users: "Cumulative Cash with Riders",
    metric: 12000,
    currencySymbol: true,
  },
];

const txType = [
  "Deposit",
  "Withdrawal",
  "Disbursement",
  "Recollection",
  "Overdue",
];

export default function Home() {
  const { allUsers } = useUsers();
  const { user } = useAuth();
  const userRole = user?.role || "Admin";

  const userMetrics = generateUserMetrics(allUsers);

  const { totalAgents } = useAgents();

  // Filter cash flow and transaction types based on role
  const filteredCashFlow =
    userRole === "Accountant"
      ? usersCashFLow.filter((metric) =>
          [
            "Total Cumulative Cash",
            "Cumulative Cash with Accountants",
          ].includes(metric.users)
        )
      : userRole === "Marketer"
      ? []
      : usersCashFLow;

  const filteredTxType =
    userRole === "Accountant"
      ? ["Deposit", "Withdrawal", "Disbursement"]
      : userRole === "Marketer"
      ? ["Recollection"]
      : txType;

  const renderDashboard = () => {
    switch (userRole) {
      case "Admin":
        return (
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
              <div>
                <div>
                  <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
                    Users Metrics
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                    {userMetrics.map((user) => (
                      <EcommerceMetrics data={user} key={user.users} />
                    ))}

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                        <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
                      </div>
                      <div className="flex items-end justify-between mt-5">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Agents
                          </span>
                          <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
                            {totalAgents}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <MonthlySalesChart title="Monthly Disbursement" color="#FF8181" />
              <MonthlySalesChart title="Monthly Transactions" />
            </div>

            <div className="col-span-12 xl:col-span-5">
              <MonthlyTarget title="Recollection Progress" />
              <div className="mt-12">
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
                  Cashflow Metrics
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                  {filteredCashFlow.map((user) => (
                    <EcommerceMetrics
                      data={user}
                      type="cash"
                      key={user.users}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-5">
              <DemographicCard />
            </div>

            <div className="col-span-12 xl:col-span-7">
              <RecentOrders
                actionButton="Filter"
                filterOptions={filteredTxType}
              />
            </div>
          </div>
        );

      case "Accountant":
        return (
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-8">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
                  Cashflow Metrics
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                  {filteredCashFlow.map((user) => (
                    <EcommerceMetrics
                      data={user}
                      type="cash"
                      key={user.users}
                    />
                  ))}
                </div>
              </div>
              <MonthlySalesChart title="Monthly Transactions" />
            </div>

            <div className="col-span-12 xl:col-span-4">
              <MonthlyTarget title="Financial Targets" />
            </div>

            <div className="col-span-12">
              <RecentOrders
                actionButton="Filter"
                filterOptions={filteredTxType}
              />
            </div>
          </div>
        );

      case "Marketer":
        return (
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
                  Users Metrics
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                  {userMetrics.map((user) => (
                    <EcommerceMetrics data={user} key={user.users} />
                  ))}
                </div>
              </div>
              <MarketerDashboard />
            </div>

            <div className="col-span-12 xl:col-span-5">
              <DemographicCard />
            </div>

            <div className="col-span-12">
              <RecentOrders
                actionButton="Filter"
                filterOptions={filteredTxType}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Role not recognized. Please contact support.
          </div>
        );
    }
  };

  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      {renderDashboard()}
    </>
  );
}
