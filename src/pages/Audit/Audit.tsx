import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { AuditLogData } from "../../types/types";
import { getAuditLogs } from "../../utils/api";
import Alert from "../../components/ui/alert/Alert";
import LogTable from "../../components/tables/BasicTables/LogTable";

const tableHeader: string[] = [
  "Action type",
  "Description",
  "Reason",
  // "Weekly referred agents",
  "Performed by",
  "time",
];

const Audit: React.FC = () => {
  const [tableData, setTableData] = useState<AuditLogData[] | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await getAuditLogs();
      if (response.success && response.data) {
        setTableData(response.data.log);
      } else {
        setAlertTitle("Error");
        setError(response.error || "Failed to fetch data");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

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
        title="Audit Log | SafulPay Agency Dashboard - Finance just got better"
        description="Log of every action performed by users - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Marketers Leaderboard" />

      <ComponentCard title="Audit Log">
        <LogTable tableHeading={tableHeader} tableContent={tableData} />
      </ComponentCard>
    </>
  );
};

export default Audit;
