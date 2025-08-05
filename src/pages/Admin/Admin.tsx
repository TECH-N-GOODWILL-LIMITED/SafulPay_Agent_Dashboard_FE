import { useEffect, useState, useMemo } from "react";
import { useUsers } from "../../context/UsersContext";
import { userRoles, ADMIN_ROLE } from "../../utils/roles";
import ComponentCard, {
  ActionButtonConfig,
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
import type { UserBio } from "../../types/types";

const tableHeader: string[] = [
  "Name / Username",
  "Role",
  "Phone Number",
  "Status",
];

const Admin = () => {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { allUsers, title, error, loading, fetchUsers } = useUsers();
  const { isOpen, openModal, closeModal } = useModal();

  const statusOptions = ["All", "Pending", "Active", "Suspended"];

  useEffect(() => {
    const params: { [key: string]: number | string } = {
      page: currentPage,
      per_page: 10,
      role: ADMIN_ROLE,
    };

    const statusMap: { [key: string]: number } = {
      Pending: 0,
      Active: 1,
      Suspended: 2,
    };
    if (filterStatus !== "All") {
      params.status = statusMap[filterStatus];
    }

    // Add search term to params if it exists
    if (searchTerm.trim()) {
      params.name = searchTerm.trim();
    }

    fetchUsers(params);
  }, [currentPage, filterStatus, searchTerm, fetchUsers]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const actionButton: ActionButtonConfig = {
    label: "Add Admin",
    onClick: openModal,
  };

  const filters: FilterConfig[] = [
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

  const searchConfig: SearchConfig = {
    placeholder: "Search by name or username...",
    onSearch: handleSearch,
    debounceMs: 500,
  };

  const tableData = useMemo(() => {
    if (!allUsers?.data?.users) {
      return [];
    }
    return allUsers.data.users.map((user: UserBio) => ({
      id: user.id,
      image: user.image || "/images/user/user-admin-vector.webp",
      name: user.name || "N/A",
      firstName: user.firstname,
      lastName: user.lastname,
      username: user.username || "No username",
      role: user.role,
      phone: user.phone || "No Phone Number",
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
        <PageBreadcrumb pageTitle="Admins" />
        <Alert variant="error" title={title} message={error} />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Admins | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency admins - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Admins" />
      {/* {loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : ( */}
      <div className="space-y-6">
        <ComponentCard
          title="Admin Table"
          desc="Details of all Admins"
          actionButton={actionButton}
        >
          <TableFilters filters={filters} searchConfig={searchConfig} />
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
      {/* )} */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <RegisterModal
          modalHeading="Add a new user"
          userRoles={userRoles}
          selectRole="Admin"
          onClose={closeModal}
        />
      </Modal>
    </>
  );
};

export default Admin;
