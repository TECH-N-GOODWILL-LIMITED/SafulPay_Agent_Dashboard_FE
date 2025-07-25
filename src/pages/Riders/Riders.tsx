import { useEffect, useState, useMemo } from "react";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { userRoles, RIDER_ROLE } from "../../utils/roles";
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

const Riders: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { title, error, loading, filteredUsers, filterByRole } = useAllUsers();
  const { isOpen, openModal, closeModal } = useModal();

  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  useEffect(() => {
    filterByRole(RIDER_ROLE);
  }, [filterByRole]);

  const actionButton: ActionButtonConfig = {
    label: "Add Rider",
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
    const filteredRiders = filteredUsers.filter((rider: usersItem) => {
      const status =
        rider.status === 1
          ? "Active"
          : rider.status === 2
          ? "Suspended"
          : rider.status === 3
          ? "Rejected"
          : "Pending";
      const statusMatch = filterStatus === "All" || status === filterStatus;
      return statusMatch;
    });

    return filteredRiders.map((rider: usersItem) => ({
      id: rider.id,
      image: "/images/user/rider-icon.jpg",
      name: rider.name,
      firstName: rider.firstname,
      lastName: rider.lastname,
      username: rider.username || "No username",
      role: rider.role,
      cih: rider.threshold_cash_in_hand || 0.0,
      phone: rider.phone || "No Phone Number",
      status:
        rider.status === 1
          ? "Active"
          : rider.status === 2
          ? "Suspended"
          : rider.status === 3
          ? "Rejected"
          : "Pending",
    }));
  }, [filteredUsers, filterStatus]);

  return (
    <>
      <PageMeta
        title="Riders | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency riders - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Riders" />

      {error ? (
        <Alert variant="error" title={title} message={error} showLink={false} />
      ) : loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Riders Table"
            desc="Details of all Riders"
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
          selectRole="Rider"
          onClose={closeModal}
        />
      </Modal>
    </>
  );
};

export default Riders;
