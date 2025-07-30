import { useEffect, useState, useMemo } from "react";
import { useUsers } from "../../context/UsersContext";
import { userRoles, ADMIN_ROLE } from "../../utils/roles";
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
import type { Users } from "../../types/types";

const tableHeader: string[] = [
  "Name / Username",
  "Role",
  "Phone Number",
  "Status",
];

const Admin = () => {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { title, error, loading, filteredUsers, filterByRole } = useUsers();
  const { isOpen, openModal, closeModal } = useModal();

  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  useEffect(() => {
    filterByRole(ADMIN_ROLE);
  }, [filterByRole]);

  const actionButton: ActionButtonConfig = {
    label: "Add Admin",
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
    const filteredAdmins = filteredUsers.filter((admin: Users) => {
      const status =
        admin.status === 1
          ? "Active"
          : admin.status === 2
          ? "Suspended"
          : admin.status === 3
          ? "Rejected"
          : "Pending";
      const statusMatch = filterStatus === "All" || status === filterStatus;
      return statusMatch;
    });

    return filteredAdmins.map((user: Users) => ({
      id: user.id,
      image: "/images/user/user-admin-vector.webp",
      name: user.name,
      firstName: user.firstname,
      lastName: user.lastname,
      username: user.username,
      role: user.role,
      phone: user.phone || "No Phone Number",
      status:
        user.status === 1
          ? "Active"
          : user.status === 2
          ? "Suspended"
          : "Pending",
    }));
  }, [filteredUsers, filterStatus]);

  return (
    <>
      <PageMeta
        title="Admins | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency admins - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Admins" />

      {error ? (
        <Alert variant="error" title={title} message={error} showLink={false} />
      ) : loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Admin Table"
            desc="Details of all Admins"
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
          selectRole="Admin"
          onClose={closeModal}
        />
      </Modal>
    </>
  );
};

export default Admin;
