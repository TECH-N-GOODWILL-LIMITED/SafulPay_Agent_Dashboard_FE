import { useEffect } from "react";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";

interface TableContentType {
  user: {
    id: number;
    image?: string;
    name?: string;
    businessName: string;
    role: string;
    phone: string;
    status: string;
  };
}

const tableHeader: string[] = [
  "Name/Business Name",
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

  const tableData: TableContentType[] = filteredUsers.map(
    (user: usersItem) => ({
      user: {
        id: user.id,
        image: "/images/user/user-17.jpg", // or actual image URL if available
        name: user.name,
        firstName: user.firstname,
        lastName: user.lastname,
        businessName: "", // add if your API provides it
        role: user.role,
        phone: user.phone,
        status:
          user.status === 1
            ? "Active"
            : user.status === 2
            ? "Suspended"
            : "Pending",
      },
    })
  );

  if (loading)
    return <div className="text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error)
    return (
      <Alert variant="error" title={title} message={error} showLink={false} />
    );

  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
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
