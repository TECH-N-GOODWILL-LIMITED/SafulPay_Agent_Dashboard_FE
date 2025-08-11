import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAgents } from "../../context/AgentsContext";
import ComponentCard, {
  ActionButtonConfig,
  DownloadButtonConfig,
} from "../../components/common/ComponentCard";
import TableFilters, {
  FilterConfig,
  SearchConfig,
} from "../../components/common/TableFilters";
import TablePagination from "../../components/common/TablePagination";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";

import { useAuth } from "../../context/AuthContext";
import { downloadAgentsData } from "../../utils/api";
import {
  prepareAgentsForExport,
  exportTableData,
} from "../../utils/downloadUtils";
import type { Agent, DownloadAgentsParams } from "../../types/types";
import { AGENT_ROLE, MERCHANT_ROLE, SUPER_AGENT_ROLE } from "../../utils/roles";
import { isValidDateFormat, validateDateRange } from "../../utils/utils";

const tableHeader: string[] = [
  "Name / Business Name",
  "Role / Model",
  "Residual Amount",
  "Business Phone / Primary Phone",
  "Referred By",
  "KYC Status",
  "Status",
  "Date Created",
];

const Agents: React.FC = () => {
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterModel, setFilterModel] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterKycStatus, setFilterKycStatus] = useState<string>("All");
  const [filterRefBy, setFilterRefBy] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");

  const { allAgents, title, error, loading, fetchAgents } = useAgents();
  const { user, token } = useAuth();

  const navigate = useNavigate();

  const roleOptions = ["All", AGENT_ROLE, SUPER_AGENT_ROLE, MERCHANT_ROLE];
  const modelOptions = ["All", "Target", "Independent"];
  const kycStatusOptions = ["All", "Completed", "Incomplete"];
  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  useEffect(() => {
    const dateRangeError = validateDateRange(
      dateRange.startDate,
      dateRange.endDate
    );
    setDateError(dateRangeError);

    if (dateRangeError) {
      return;
    }

    const params: { [key: string]: number | string } = {
      page: currentPage,
      per_page: 10,
    };

    if (filterRole !== "All") {
      params.type = filterRole;
    }

    if (filterModel !== "All") {
      params.model = filterModel;
    }

    const statusMap: { [key: string]: number } = {
      Pending: 0,
      Active: 1,
      Suspended: 2,
      Rejected: 3,
    };
    if (filterStatus !== "All") {
      params.status = statusMap[filterStatus];
    }

    const kycStatusMap: { [key: string]: number } = {
      Completed: 1,
      Incomplete: 0,
    };
    if (filterKycStatus !== "All") {
      params.temp = kycStatusMap[filterKycStatus];
    }

    if (searchTerm.trim()) {
      params.name = searchTerm.trim();
    }

    if (filterRefBy.trim()) {
      params.ref_by = filterRefBy.trim();
    }

    // Only add dates if they are properly formatted
    if (dateRange.startDate && isValidDateFormat(dateRange.startDate)) {
      params.startDate = dateRange.startDate;
    }

    if (dateRange.endDate && isValidDateFormat(dateRange.endDate)) {
      params.endDate = dateRange.endDate;
    }

    fetchAgents(params);
  }, [
    currentPage,
    filterRole,
    filterModel,
    filterStatus,
    filterKycStatus,
    filterRefBy,
    searchTerm,
    dateRange,
    fetchAgents,
  ]);

  const handleAddAgent = () => {
    if (user?.referral_code) {
      navigate(`/onboardagent/${user.referral_code}`);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const searchConfig: SearchConfig = {
    placeholder: "Search by name or business name...",
    onSearch: handleSearch,
    debounceMs: 500,
  };

  const filters: FilterConfig[] = [
    {
      label: `Role: ${filterRole}`,
      options: roleOptions,
      onSelect: (role) => {
        setFilterRole(role);
        setCurrentPage(1);
      },
      value: filterRole,
    },
    {
      label: `Model: ${filterModel}`,
      options: modelOptions,
      onSelect: (model) => {
        setFilterModel(model);
        setCurrentPage(1);
      },
      value: filterModel,
    },
    {
      label: `KYC: ${filterKycStatus}`,
      options: kycStatusOptions,
      onSelect: (status) => {
        setFilterKycStatus(status);
        setCurrentPage(1);
      },
      value: filterKycStatus,
    },
    {
      label: `Status: ${filterStatus}`,
      options: statusOptions,
      onSelect: (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
      },
      value: filterStatus,
    },
  ];

  const actionButton: ActionButtonConfig = {
    label: "Add Agent",
    onClick: handleAddAgent,
  };

  // Download handler
  const handleDownloadAgents = async (format: "csv" | "excel") => {
    if (!token) return;

    const params: DownloadAgentsParams = {
      format,
    };

    if (filterRole !== "All") {
      params.type = filterRole;
    }

    if (filterModel !== "All") {
      params.model = filterModel;
    }

    const statusMap: { [key: string]: number } = {
      Pending: 0,
      Active: 1,
      Suspended: 2,
      Rejected: 3,
    };
    if (filterStatus !== "All") {
      params.status = statusMap[filterStatus];
    }

    const kycStatusMap: { [key: string]: number } = {
      Completed: 1,
      Incomplete: 0,
    };
    if (filterKycStatus !== "All") {
      params.temp = kycStatusMap[filterKycStatus];
    }

    if (searchTerm.trim()) {
      params.name = searchTerm.trim();
    }

    if (filterRefBy.trim()) {
      params.ref_by = filterRefBy.trim();
    }

    if (dateRange.startDate && isValidDateFormat(dateRange.startDate)) {
      params.startDate = dateRange.startDate;
    }

    if (dateRange.endDate && isValidDateFormat(dateRange.endDate)) {
      params.endDate = dateRange.endDate;
    }

    const response = await downloadAgentsData(token, params);
    if (response.success && response.data) {
      const preparedData = await prepareAgentsForExport(response.data.data);
      const headers = [
        "Name",
        "Business Name",
        "Role/Model",
        "KYC Status",
        "Status",
        "Primary Phone",
        "Business Phone",
        "Residual Amount",
        "Referred By",
        "Address",
        "Region",
        "District",
        "Latitude",
        "Longitude",
        "ID Type",
        "ID Document",
        "Business Registration",
        "Business Image",
        "Address Document",
        "Created At",
      ];
      exportTableData(
        preparedData,
        headers,
        `agents-export-${new Date().toISOString().split("T")[0]}`,
        format
      );
    } else {
      throw new Error(response.error || "Failed to download agents data");
    }
  };

  const downloadButton: DownloadButtonConfig = {
    label: "Download Agents Data",
    onDownload: handleDownloadAgents,
    disabled: loading,
  };

  const tableData = useMemo(() => {
    if (!allAgents?.data) {
      return [];
    }
    return allAgents.data.map((agent: Agent) => ({
      id: agent.id,
      image: agent.image || "/images/user/agent-image.png",
      name: agent.name || "N/A",
      firstName: agent.firstname,
      lastName: agent.lastname,
      businessName: agent.business_name || "No Business name",
      username: agent.username || "No username",
      role: agent.type,
      model: agent.type !== MERCHANT_ROLE ? agent.model : "Independent",
      residualAmount: agent?.residual_amount || 0.0,
      phone: agent.phone || "No Phone number",
      businessPhone: agent.business_phone || "No Business phone",
      address: agent.address,
      latitude: agent.latitude,
      longitude: agent.longitude,
      idType: agent.id_type,
      idDocument: agent.id_document,
      bizRegDocument: agent.business_registration,
      businessImage: agent.business_image,
      refBy: agent.ref_by,
      status:
        agent.status === 1
          ? "Active"
          : agent.status === 2
          ? "Suspended"
          : agent.status === 3
          ? "Rejected"
          : "Pending",
      temp: agent.temp,
      kycStatus: agent.temp === 1 ? "Completed" : "Incomplete",
      createdAt: agent.created_at,
      updatedAt: agent.updated_at,
    }));
  }, [allAgents]);

  if (error) {
    return (
      <>
        <PageMeta
          title="Error | SafulPay's Agency Dashboard - Finance just got better"
          description="You are not authorized to view this page."
        />
        <PageBreadcrumb pageTitle="Agents &amp; Merchants" />
        <Alert variant="error" title={title} message={error} />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Agents | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency agents - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Agents &amp; Merchants" />

      <div className="space-y-6">
        <ComponentCard
          title="Vendors Table"
          desc="Details of all Merchants, Super Agents &amp; Agents"
          actionButton={actionButton}
          downloadButton={downloadButton}
        >
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
            referralFilter={{
              value: filterRefBy,
              onChange: (value) => {
                setFilterRefBy(value);
                setCurrentPage(1);
              },
              placeholder: "Enter referral code",
              token: token || undefined,
            }}
          />
          <BasicTableOne
            tableHeading={tableHeader}
            tableContent={tableData}
            loading={loading}
            setCurrentPage={setCurrentPage}
          />
          <TablePagination
            pagination={{
              currentPage,
              totalPages: allAgents?.last_page || 1,
              totalItems: allAgents?.total_filter_result || 0,
              perPage: allAgents?.per_page || 10,
              loading: loading,
              onPageChange: (page: number) => setCurrentPage(page),
            }}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default Agents;
