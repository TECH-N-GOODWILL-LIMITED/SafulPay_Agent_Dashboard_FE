import { useEffect } from "react";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";

const tableHeader: string[] = [
  "Name / Username",
  "Role",
  "Phone Number",
  "Status",
];

const Users: React.FC = () => {
  const { fetchUsers, title, error, loading, filteredUsers, filterByRole } =
    useAllUsers();

  useEffect(() => {
    fetchUsers();
  }, []);

  const userOptions = [...userRoles, "All Users"];

  const tableData = filteredUsers.map((user: usersItem) => ({
    id: user.id,
    image: user.image || "/images/user/user-12.jpg", // fallback image
    name: user.name || "N/A",
    firstName: user.firstname,
    lastName: user.lastname,
    businessName: user.business_name || "No Business name",
    username: user.username || "No username",
    role:
      user.role === "Agent" || user.role === "Merchant" ? user.type : user.role,
    model: user.model,
    phone: user.phone || "No Phone number",
    businessPhone: user.business_phone || "No Business phone",
    address: user.address,
    latitude: user.latitude,
    longitude: user.longitude,
    idType: user.id_type,
    idDocument: user.id_document,
    bizRegDocument: user.bussiness_registration,
    businessImage: user.bussiness_image,
    status:
      user.status === 1
        ? "Active"
        : user.status === 2
        ? "Suspended"
        : user.status === 3
        ? "Rejected"
        : "Pending",
  }));

  if (loading)
    return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error)
    return (
      <Alert variant="error" title={title} message={error} showLink={false} />
    );

  return (
    <>
      <PageMeta
        title="Users | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency users - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Users" />
      <div className="space-y-6">
        <ComponentCard
          title="Users Table"
          desc="Details of all users with various account types"
          actionButton1="Filter"
          onItemClick={filterByRole}
          userType="User"
          userRoles={userRoles}
          filterOptions={userOptions}
        >
          <BasicTableOne tableHeading={tableHeader} tableContent={tableData} />
        </ComponentCard>
      </div>
    </>
  );
};

export default Users;
