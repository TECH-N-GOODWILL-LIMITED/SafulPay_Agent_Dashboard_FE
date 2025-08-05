import React, { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard, {
  DownloadButtonConfig,
} from "../../components/common/ComponentCard";
import TableFilters, {
  FilterConfig,
  SearchConfig,
} from "../../components/common/TableFilters";
import TablePagination from "../../components/common/TablePagination";

import { AuditLogData } from "../../types/types";
import { getAuditLogs, downloadAuditLogsData } from "../../utils/api";
import type {
  DownloadAuditLogsParams,
  GetAuditLogsParams,
} from "../../types/types";
import {
  prepareAuditLogsForExport,
  exportTableData,
} from "../../utils/downloadUtils";
import Alert from "../../components/ui/alert/Alert";
import LogTable from "../../components/tables/BasicTables/LogTable";
import { useAuth } from "../../context/AuthContext";
import { isValidDateFormat, validateDateRange } from "../../utils/utils";

const tableHeader: string[] = [
  "Action type",
  "Reason",
  "Description",
  "Performed by",
  "Date Performed",
];

const Audit: React.FC = () => {
  const [tableData, setTableData] = useState<AuditLogData[] | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterAction, setFilterAction] = useState<string>("All");
  const [filterPerformedBy, setFilterPerformedBy] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dateError, setDateError] = useState<string>("");
  const [paginationData, setPaginationData] = useState<{
    totalPages: number;
    totalItems: number;
    perPage: number;
  }>({
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });

  const { token } = useAuth();

  const handleDownloadAuditLogs = async (format: "csv" | "excel") => {
    if (!token) return;

    const params: DownloadAuditLogsParams = {
      format,
    };

    if (filterAction !== "All") {
      params.action = filterAction;
    }

    if (filterPerformedBy.trim()) {
      params.performed_by = filterPerformedBy;
    }

    // Note: description is not available in DownloadAuditLogsParams
    // We'll need to add it to the interface if needed

    // Only add dates if they are properly formatted
    if (dateRange.startDate && isValidDateFormat(dateRange.startDate)) {
      params.startDate = dateRange.startDate;
    }

    if (dateRange.endDate && isValidDateFormat(dateRange.endDate)) {
      params.endDate = dateRange.endDate;
    }

    const response = await downloadAuditLogsData(token, params);
    if (response.success && response.data) {
      const preparedData = prepareAuditLogsForExport(response.data.data);
      const headers = [
        "Action Type",
        "Table",
        "Reason",
        "Description",
        "Performed By",
        "Role",
        "IP Address",
        "Time",
      ];
      exportTableData(
        preparedData,
        headers,
        `audit-logs-export-${new Date().toISOString().split("T")[0]}`,
        format
      );
    } else {
      throw new Error(response.error || "Failed to download audit logs data");
    }
  };

  const downloadButton: DownloadButtonConfig = {
    label: "Download Audit Logs",
    onDownload: handleDownloadAuditLogs,
    disabled: loading,
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const searchConfig: SearchConfig = {
    placeholder: "Search by description...",
    onSearch: handleSearch,
    debounceMs: 500,
  };

  const filters: FilterConfig[] = [
    {
      label: `Action: ${filterAction}`,
      options: ["All", "Create", "Update", "Delete", "Export"],
      onSelect: (action) => {
        setFilterAction(action);
        setCurrentPage(1);
      },
      value: filterAction,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      const dateRangeError = validateDateRange(
        dateRange.startDate,
        dateRange.endDate
      );
      setDateError(dateRangeError);

      if (dateRangeError) {
        return;
      }

      setLoading(true);
      const params: GetAuditLogsParams = {
        page: currentPage,
        per_page: 10,
      };

      if (filterAction !== "All") {
        params.action = filterAction;
      }

      if (filterPerformedBy.trim()) {
        params.performed_by = filterPerformedBy.trim();
      }

      if (searchTerm.trim()) {
        params.description = searchTerm.trim();
      }

      // Only add dates if they are properly formatted
      if (dateRange.startDate && isValidDateFormat(dateRange.startDate)) {
        params.startDate = dateRange.startDate;
      }

      if (dateRange.endDate && isValidDateFormat(dateRange.endDate)) {
        params.endDate = dateRange.endDate;
      }

      const response = await getAuditLogs(token, params);
      if (response.success && response.data) {
        setTableData(response.data.data);
        setPaginationData({
          totalPages: response.data.last_page,
          totalItems: response.data.total_filter_result,
          perPage: response.data.per_page,
        });
      } else {
        setAlertTitle("Error");
        setError(response.error || "Failed to fetch data");
      }
      setLoading(false);
    };

    fetchData();
  }, [
    token,
    filterAction,
    filterPerformedBy,
    searchTerm,
    dateRange,
    currentPage,
  ]);

  return (
    <>
      <PageMeta
        title="Audit Log | SafulPay Agency Dashboard - Finance just got better"
        description="Log of every action performed by users - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Audit Log" />
      {error ? (
        <Alert variant="error" title={alertTitle} message={error} />
      ) : (
        <ComponentCard title="Log Table" downloadButton={downloadButton}>
          <TableFilters
            filters={filters}
            searchConfig={searchConfig}
            dateFilter={{
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
              onDateRangeChange: (startDate, endDate) => {
                setDateRange({ startDate, endDate });
                setCurrentPage(1);
              },
            }}
            dateError={dateError}
            performedByFilter={{
              value: filterPerformedBy,
              onChange: (value) => {
                setFilterPerformedBy(value);
                setCurrentPage(1);
              },
              placeholder: "Enter performed by name",
            }}
          />
          <LogTable
            tableHeading={tableHeader}
            tableContent={tableData}
            loading={loading}
          />
          <TablePagination
            pagination={{
              currentPage,
              totalPages: paginationData.totalPages,
              totalItems: paginationData.totalItems,
              perPage: paginationData.perPage,
              loading: loading,
              onPageChange: (page: number) => setCurrentPage(page),
            }}
          />
        </ComponentCard>
      )}
    </>
  );
};

export default Audit;
