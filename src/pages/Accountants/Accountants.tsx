import { useEffect, useState, useMemo } from "react";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { userRoles, ACCOUNTANT_ROLE } from "../../utils/roles";
import ComponentCard, {
  ActionButtonConfig,
  FilterConfig,
} from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import RegisterModal from "../../components/common/RegisterModal";

const tableHeader: string[] = [
  "Name / Username",
  "Role",
  "Cash in hand",
  "Phone Number",
  "Status",
];

const Accountants: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { title, error, loading, filteredUsers, filterByRole } = useAllUsers();
  const { isOpen, openModal, closeModal } = useModal();

  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  useEffect(() => {
    filterByRole(ACCOUNTANT_ROLE);
  }, [filterByRole]);

  const actionButton: ActionButtonConfig = {
    label: "Add Accountant",
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
    const filteredAccountants = filteredUsers.filter(
      (accountant: usersItem) => {
        const status =
          accountant.status === 1
            ? "Active"
            : accountant.status === 2
            ? "Suspended"
            : accountant.status === 3
            ? "Rejected"
            : "Pending";
        const statusMatch = filterStatus === "All" || status === filterStatus;
        return statusMatch;
      }
    );

    return filteredAccountants.map((accountant: usersItem) => ({
      id: accountant.id,
      image: "/images/user/accountant-icon.jpg", // or actual image URL if available
      name: accountant.name,
      firstName: accountant.firstname,
      lastName: accountant.lastname,
      username: accountant.username,
      role: accountant.role,
      cih: accountant.threshold_cash_in_hand || 0.0,
      phone: accountant.phone || "No Phone Number",
      status:
        accountant.status === 1
          ? "Active"
          : accountant.status === 2
          ? "Suspended"
          : accountant.status === 3
          ? "Rejected"
          : "Pending",
    }));
  }, [filteredUsers, filterStatus]);

  return (
    <>
      <PageMeta
        title="Accountants | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency accountants - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Accountants" />

      {error ? (
        <Alert variant="error" title={title} message={error} showLink={false} />
      ) : loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Accountants Table"
            desc="Details of all Accountants"
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
          selectRole="Accountant"
          onClose={closeModal}
        />
      </Modal>
    </>
  );
};

export default Accountants;
