import { useEffect, useState, useMemo } from "react";
import { useUsers } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
import ComponentCard, {
  ActionButtonConfig,
  FilterConfig,
  SearchConfig,
} from "../../components/common/ComponentCard";
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

const Users: React.FC = () => {
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { allUsers, title, error, loading, fetchUsers } = useUsers();
  const { isOpen, openModal, closeModal } = useModal();

  const allRoles = ["All", ...userRoles];
  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  useEffect(() => {
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
      Rejected: 3,
    };
    if (filterStatus !== "All") {
      params.status = statusMap[filterStatus];
    }

    if (searchTerm.trim()) {
      params.name = searchTerm.trim();
    }

    fetchUsers(params);
  }, [currentPage, filterRole, filterStatus, searchTerm, fetchUsers]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
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
    icon: "✚",
    onClick: openModal,
  };

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
          : user.status === 3
          ? "Rejected"
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
          filters={filters}
          actionButton={actionButton}
          searchConfig={searchConfig}
          pagination={{
            currentPage,
            totalPages: allUsers?.last_page || 1,
            totalItems: allUsers?.total_filter_result || 0,
            perPage: allUsers?.per_page || 10,
            loading: loading,
            onPageChange: (page) => setCurrentPage(page),
          }}
        >
          <BasicTableOne tableHeading={tableHeader} tableContent={tableData} />
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
