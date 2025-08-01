import { useEffect, useState, useMemo } from "react";
import { userRoles, ADMIN_ROLE, MARKETER_ROLE } from "../../utils/roles";
import { useUsers } from "../../context/UsersContext";
import ComponentCard, {
  ActionButtonConfig,
  FilterConfig,
  SearchConfig,
} from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";
import { useAuth } from "../../context/AuthContext";
import { useAllMarketers } from "../../context/MarketersContext";
import type { UserBio } from "../../types/types";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import RegisterModal from "../../components/common/RegisterModal";

const tableHeader: string[] = [
  "Name / Username",
  "Role",
  "Code",
  "Phone Number",
  "Status",
];

const AdminView: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { allUsers, title, error, loading, fetchUsers } = useUsers();
  const { isOpen, openModal, closeModal } = useModal();

  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  useEffect(() => {
    const params: { [key: string]: number | string } = {
      page: currentPage,
      per_page: 10,
      role: MARKETER_ROLE,
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
    label: "Add Marketer",
    icon: "✚",
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
      image: user.image || "/images/user/user-12.jpg",
      name: user.name || "N/A",
      firstName: user.firstname,
      lastName: user.lastname,
      username: user.username || "No username",
      role: user.role,
      code: user.referral_code || "N/A",
      phone: user.phone || "No Phone Number",
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
        <PageBreadcrumb pageTitle="Marketers" />
        <Alert variant="error" title={title} message={error} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <ComponentCard
          title="Marketers Table"
          desc="Details of all Marketers"
          actionButton={actionButton}
          filters={filters}
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
          selectRole="Marketer"
          onClose={closeModal}
        />
      </Modal>
    </>
  );
};

const MarketerView: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { error, loading, allMarketers } = useAllMarketers();

  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  const filters: FilterConfig[] = [
    {
      label: `Status: ${filterStatus}`,
      options: statusOptions,
      onSelect: (status) => setFilterStatus(status),
      value: filterStatus,
    },
  ];

  const tableData = useMemo(() => {
    const filteredMarketers = allMarketers.filter((marketer: UserBio) => {
      const status =
        marketer.status === 1
          ? "Active"
          : marketer.status === 2
          ? "Suspended"
          : marketer.status === 3
          ? "Rejected"
          : "Pending";
      const statusMatch = filterStatus === "All" || status === filterStatus;
      return statusMatch;
    });

    return filteredMarketers.map((marketer: UserBio) => ({
      id: marketer.id,
      image: marketer.image || "/images/user/user-12.jpg",
      name: marketer.name,
      firstName: marketer.firstname,
      lastName: marketer.lastname,
      username: marketer.username,
      role: marketer.role,
      code: marketer.referral_code || "N/A",
      phone: marketer.phone || "No Phone Number",
      status:
        marketer.status === 1
          ? "Active"
          : marketer.status === 2
          ? "Suspended"
          : marketer.status === 3
          ? "Rejected"
          : "Pending",
    }));
  }, [allMarketers, filterStatus]);

  return (
    <>
      {error ? (
        <Alert variant="error" title="Error" message={error} showLink={false} />
      ) : loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Marketers Table"
            desc="Details of all Marketers"
            filters={filters}
          >
            <BasicTableOne
              tableHeading={tableHeader}
              tableContent={tableData}
            />
          </ComponentCard>
        </div>
      )}
    </>
  );
};

const Marketers: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <PageMeta
        title="Marketers | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency marketers - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Marketers" />

      {user?.role === ADMIN_ROLE && <AdminView />}
      {user?.role === MARKETER_ROLE && <MarketerView />}
    </>
  );
};

export default Marketers;
