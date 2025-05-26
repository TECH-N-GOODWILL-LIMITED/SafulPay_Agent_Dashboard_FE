import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import RDprogressChart from "../../components/ecommerce/RDprogressChart";

export interface usersMetric {
  users: string;
  metric: number;
  currencySymbol?: boolean;
  // cash: string;
  // amount?: number;
}

const users: usersMetric[] = [
  { users: "Total Users", metric: 120 },
  { users: "Admin", metric: 5 },
  { users: "Marketers", metric: 6 },
  { users: "Agents", metric: 103 },
  { users: "Accountants", metric: 2 },
  { users: "Riders", metric: 4 },
];

const usersCashFLow: usersMetric[] = [
  { users: "Total Cummulative Cash", metric: 120000, currencySymbol: true },
  {
    users: "Cummulative Cash with Agents",
    metric: 103000,
    currencySymbol: true,
  },
  {
    users: "Cummulative Cash with Accountants",
    metric: 24000,
    currencySymbol: true,
  },
  {
    users: "Cummulative Cash with Riders",
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
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <div>
            <div>
              <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
                Users Metrix
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                {users.map((user) => (
                  <EcommerceMetrics data={user} />
                ))}
              </div>
            </div>
          </div>
          <MonthlySalesChart title="Monthly Disbursement" color="#FF8181" />
          <MonthlySalesChart title="Monthly Transactions" />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <RDprogressChart />
          <div className="mt-12">
            <h3 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white/90">
              Cashflow Metrix
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              {usersCashFLow.map((user) => (
                <EcommerceMetrics data={user} type="cash" />
              ))}
            </div>
          </div>
        </div>

        {/* <div className="col-span-12">
          <StatisticsChart />
        </div> */}

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders actionButton="Filter" filterOptions={txType} />
        </div>
      </div>
    </>
  );
}
