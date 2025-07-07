import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import LeaderboardTable from "../../components/tables/BasicTables/LeaderBoardTable";
import Alert from "../../components/ui/alert/Alert";
import { getMarketersStats } from "../../utils/api";
import { MarketerStats } from "../../types/types";
import PageMeta from "../../components/common/PageMeta";
import StatsCard from "../../components/common/StatsCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function MarketersLeaderboard() {
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

  const tableHeader: string[] = [
    "Full name / Username",
    "Referral code",
    "Total agents",
    // "Weekly referred agents",
    "Agents last week",
    "Agents this week",
  ];

  if (loading)
    return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error)
    return (
      <Alert
        variant="error"
        title={alertTitle}
        message={error}
        showLink={false}
      />
    );

  return (
    <>
      <PageMeta
        title="Marketers Leaderboard | SafulPay Agency Dashboard - Finance just got better"
        description="Marketers agency onboarding stats - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Marketers Leaderboard" />
      <div className="space-y-5 sm:space-y-6">
        <StatsCard statsData={tableData} />
        <ComponentCard title="Leaderboard">
          <LeaderboardTable
            tableHeading={tableHeader}
            tableContent={tableData?.data}
          />
        </ComponentCard>
      </div>
    </>
  );
}
