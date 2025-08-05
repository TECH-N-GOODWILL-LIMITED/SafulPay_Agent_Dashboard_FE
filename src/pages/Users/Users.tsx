import { useEffect, useState, useMemo } from "react";
import { useUsers } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
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
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import RegisterModal from "../../components/common/RegisterModal";

import { useAuth } from "../../context/AuthContext";
import { downloadUsersData } from "../../utils/api";
import {
  prepareUsersForExport,
  exportTableData,
} from "../../utils/downloadUtils";
import type { DownloadParams, UserBio } from "../../types/types";

const tableHeader: string[] = [
  "Name / Username",
  "Role",
  "Phone Number",
  "Status",
];

const Users: React.FC = () => {
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
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

  const { allUsers, title, error, loading, fetchUsers } = useUsers();
  const { isOpen, openModal, closeModal } = useModal();
  const { token } = useAuth();

  const allRoles = ["All", ...userRoles];
  const statusOptions = ["All", "Pending", "Active", "Suspended"];

  // Helper function to validate date format (YYYY-MM-DD)
  const isValidDateFormat = (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const parsedDate = new Date(date);
    return (
      !isNaN(parsedDate.getTime()) &&
      parsedDate.toISOString().split("T")[0] === date
    );
  };

  // Helper function to validate date range
  const validateDateRange = (start: string, end: string): string => {
    if (!start || !end) return ""; // Allow empty dates

    if (!isValidDateFormat(start) || !isValidDateFormat(end)) {
      return "Please enter valid dates in YYYY-MM-DD format";
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    if (startDate > today || endDate > today) {
      return "Date cannot be greater than today";
    }

    if (startDate > endDate) {
      return "Start date cannot be greater than end date";
    }

    return "";
  };

  useEffect(() => {
    // Validate date range
    const dateRangeError = validateDateRange(
      dateRange.startDate,
      dateRange.endDate
    );
    setDateError(dateRangeError);

    if (dateRangeError) {
      return; // Don't make API call if there's a date error
    }

    const params: { [key: string]: number | string } = {
      page: currentPage,
      per_page: 10,
    };

    if (filterRole !== "All") {
      params.role = filterRole;
    }

    const statusMap: { [key: string]: number } = {
      Pending: 0,
      Active: 1,
      Suspended: 2,
    };
    if (filterStatus !== "All") {
      params.status = statusMap[filterStatus];
    }

    if (searchTerm.trim()) {
      params.name = searchTerm.trim();
    }

    // Only add dates if they are properly formatted
    if (dateRange.startDate && isValidDateFormat(dateRange.startDate)) {
      params.startDate = dateRange.startDate;
    }

    if (dateRange.endDate && isValidDateFormat(dateRange.endDate)) {
      params.endDate = dateRange.endDate;
    }

    fetchUsers(params);
  }, [
    currentPage,
    filterRole,
    filterStatus,
    searchTerm,
    dateRange,
    fetchUsers,
  ]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const searchConfig: SearchConfig = {
    placeholder: "Search by name or username...",
    onSearch: handleSearch,
    debounceMs: 500,
  };

  const filters: FilterConfig[] = [
    {
      label: `Role: ${filterRole}`,
      options: allRoles,
      onSelect: (role) => {
        setFilterRole(role);
        setCurrentPage(1);
      },
      value: filterRole,
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
    label: "Add User",
    onClick: openModal,
  };

  // Download handler
  const handleDownloadUsers = async (format: "csv" | "excel") => {
    if (!token) return;

    const params: DownloadParams = {
      format,
    };

    if (filterRole !== "All") {
      params.role = filterRole;
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

    if (searchTerm.trim()) {
      params.name = searchTerm.trim();
    }

    // Only add dates if they are properly formatted
    if (dateRange.startDate && isValidDateFormat(dateRange.startDate)) {
      params.startDate = dateRange.startDate;
    }

    if (dateRange.endDate && isValidDateFormat(dateRange.endDate)) {
      params.endDate = dateRange.endDate;
    }

    const response = await downloadUsersData(token, params);
    if (response.success && response.data) {
      const preparedData = prepareUsersForExport(response.data.data);
      const headers = [
        "Name",
        "Username",
        "Role",
        "Phone",
        "Email",
        "Referral Code",
        "Country",
        "Status",
        "Created At",
      ];
      exportTableData(
        preparedData,
        headers,
        `users-export-${new Date().toISOString().split("T")[0]}`,
        format
      );
    } else {
      throw new Error(response.error || "Failed to download users data");
    }
  };

  const downloadButton: DownloadButtonConfig = {
    label: "Download Users Data",
    onDownload: handleDownloadUsers,
    disabled: loading,
  };

  const tableData = useMemo(() => {
    if (!allUsers?.data?.users) {
      return [];
    }
    return allUsers.data.users.map((user: UserBio) => ({
      id: user.id,
      image: user.image || "/images/user/user-image.jpg", // fallback image
      name: user.name || "N/A",
      firstName: user.firstname,
      lastName: user.lastname,
      username: user.username || "No username",
      role: user.role,
      phone: user.phone || "No Phone number",
      email: user.email,
      status:
        user.status === 1
          ? "Active"
          : user.status === 2
          ? "Suspended"
          : "Pending",
    }));
  }, [allUsers]);

  if (error) {
    return (
      <>
        <PageMeta
          title="Error | SafulPay's Agency Dashboard - Finance just got better"
          description="You are not authorized to view this page."
        />
        <PageBreadcrumb pageTitle="All Users" />
        <Alert variant="error" title={title} message={error} />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Users | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency users - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="All Users" />
      <div className="space-y-6">
        <ComponentCard
          title="Users Table"
          desc="Details of all users with various account types"
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
          />

          <BasicTableOne tableHeading={tableHeader} tableContent={tableData} />

          <TablePagination
            pagination={{
              currentPage,
              totalPages: allUsers?.last_page || 1,
              totalItems: allUsers?.total_filter_result || 0,
              perPage: allUsers?.per_page || 10,
              loading: loading,
              onPageChange: (page: number) => setCurrentPage(page),
            }}
          />
        </ComponentCard>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <RegisterModal
          modalHeading="Add a new user"
          userRoles={userRoles}
          onClose={closeModal}
        />
      </Modal>
    </>
  );
};

export default Users;
