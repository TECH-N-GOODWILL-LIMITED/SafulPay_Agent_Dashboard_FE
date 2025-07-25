import { useEffect, useState, useMemo } from "react";
import { userRoles, ADMIN_ROLE, MARKETER_ROLE } from "../../utils/roles";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import ComponentCard, {
  ActionButtonConfig,
  FilterConfig,
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
  const { title, error, loading, filteredUsers, filterByRole } = useAllUsers();
  const { isOpen, openModal, closeModal } = useModal();

  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  useEffect(() => {
    filterByRole(MARKETER_ROLE);
  }, [filterByRole]);

  const actionButton: ActionButtonConfig = {
    label: "Add Marketer",
    icon: "✚",
    onClick: openModal,
  };

  const filters: FilterConfig[] = [
    {
      label: `Status: ${filterStatus}`,
      options: statusOptions,
      onSelect: (status) => setFilterStatus(status),
      value: filterStatus,
    },
  ];

  const tableData = useMemo(() => {
    const filteredMarketers = filteredUsers.filter((marketer: usersItem) => {
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

    return filteredMarketers.map((marketer: usersItem) => ({
      id: marketer.id,
      image: "/images/user/user-12.jpg", // or actual image URL if available
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
  }, [filteredUsers, filterStatus]);

  return (
    <>
      {error ? (
        <Alert variant="error" title={title} message={error} showLink={false} />
      ) : loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Marketers Table"
            desc="Details of all Marketers"
            actionButton={actionButton}
            filters={filters}
          >
            <BasicTableOne
              tableHeading={tableHeader}
              tableContent={tableData}
            />
          </ComponentCard>
        </div>
      )}
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
