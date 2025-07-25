import { useState, useMemo } from "react";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
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
  "Phone Number",
  "Status",
];

const Users: React.FC = () => {
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { allUsers, title, error, loading } = useAllUsers();
  const { isOpen, openModal, closeModal } = useModal();

  const allRoles = ["All", ...userRoles];
  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  const filters: FilterConfig[] = [
    {
      label: `Role: ${filterRole}`,
      options: allRoles,
      onSelect: (role) => setFilterRole(role),
      value: filterRole,
    },
    {
      label: `Status: ${filterStatus}`,
      options: statusOptions,
      onSelect: (status) => setFilterStatus(status),
      value: filterStatus,
    },
  ];

  const actionButton: ActionButtonConfig = {
    label: "Add User",
    icon: "✚",
    onClick: openModal,
  };

  const tableData = useMemo(() => {
    const filteredUsers = allUsers.filter((user: usersItem) => {
      const status =
        user.status === 1
          ? "Active"
          : user.status === 2
          ? "Suspended"
          : user.status === 3
          ? "Rejected"
          : "Pending";
      const statusMatch = filterStatus === "All" || status === filterStatus;
      const roleMatch = filterRole === "All" || user.role === filterRole;

      return roleMatch && statusMatch;
    });

    return filteredUsers.map((user: usersItem) => ({
      id: user.id,
      // image: user.image || "/images/user/user-image.jpg", // fallback image
      image: "/images/user/user-image.jpg", // fallback image
      name: user.name || "N/A",
      firstName: user.firstname,
      lastName: user.lastname,
      businessName: user.business_name || "No Business name",
      username: user.username || "No username",
      role:
        user.role === "Agent" || user.role === "Merchant"
          ? user.type
          : user.role,
      model: user.model,
      phone: user.phone || "No Phone number",
      businessPhone: user.business_phone || "No Business phone",
      address: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      idType: user.id_type,
      idDocument: user.id_document,
      bizRegDocument: user.business_registration,
      businessImage: user.business_image,
      temp: user.temp,
      status:
        user.status === 1
          ? "Active"
          : user.status === 2
          ? "Suspended"
          : user.status === 3
          ? "Rejected"
          : "Pending",
    }));
  }, [allUsers, filterRole, filterStatus]);

  return (
    <>
      <PageMeta
        title="Users | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency users - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="All Users" />

      {error ? (
        <Alert variant="error" title={title} message={error} showLink={false} />
      ) : loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Users Table"
            desc="Details of all users with various account types"
            filters={filters}
            actionButton={actionButton}
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
          onClose={closeModal}
        />
      </Modal>
    </>
  );
};

export default Users;
