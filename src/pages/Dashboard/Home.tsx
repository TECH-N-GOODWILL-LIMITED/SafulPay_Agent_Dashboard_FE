import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { useAllUsers } from "../../context/UsersContext";
import { generateUserMetrics } from "../../utils/utils";
import type { usersMetric } from "../../types/types";

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
  const { allUsers } = useAllUsers();

  const userMetrics = generateUserMetrics(allUsers);

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
                {userMetrics.map((user) => (
                  <EcommerceMetrics data={user} key={user.users} />
                ))}
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
              Cashflow Metrix
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              {usersCashFLow.map((user) => (
                <EcommerceMetrics data={user} type="cash" key={user.users} />
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
