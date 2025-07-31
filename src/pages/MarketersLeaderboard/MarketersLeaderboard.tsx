import { useAllMarketers } from "../../context/MarketersContext";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import PageMeta from "../../components/common/PageMeta";
import StatsCard from "../../components/common/StatsCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import LeaderboardTable from "../../components/tables/BasicTables/LeaderboardTable";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function MarketersLeaderboard() {
  const { marketerStats: tableData, loading, error } = useAllMarketers();

  const tableHeader: string[] = [
    "Rank",
    "Full name / Username",
    "Referral code",
    "Total agents",
    // "Weekly referred agents",
    "Agents last week",
    "Agents this week",
  ];

  if (loading) {
    return <LoadingSpinner text="Loading marketers data..." />;
  }

  if (error) {
    return (
      <Alert variant="error" title="Error" message={error} showLink={false} />
    );
  }

  return (
    <>
      <PageMeta
        title="Marketers Leaderboard | SafulPay Agency Dashboard - Finance just got better"
        description="Marketers agency onboarding stats - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Marketers Leaderboard" />
      <div className="space-y-5 sm:space-y-6">
        <StatsCard statsData={tableData} />
        <ComponentCard title="Leaderboard" desc="Marketers leaderboard ranking">
          <LeaderboardTable
            tableHeading={tableHeader}
            tableContent={tableData?.data}
          />
        </ComponentCard>
      </div>
    </>
  );
}
