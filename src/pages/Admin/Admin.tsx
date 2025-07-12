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

const Admin = () => {
  const { title, error, loading, filteredUsers, filterByRole } = useAllUsers();

  useEffect(() => {
    filterByRole("Admin");
  }, [filterByRole]);

  const tableData = filteredUsers?.map((user: usersItem) => ({
    id: user.id,
    image: user.image || "/images/user/user-07.jpg",
    name: user.name,
    firstName: user.firstname,
    lastName: user.lastname,
    username: user.username,
    role: user.role,
    phone: user.phone,
    status:
      user.status === 1
        ? "Active"
        : user.status === 2
        ? "Suspended"
        : "Pending",
  }));

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
            title="Admins Table"
            desc="Details of all Admins"
            actionButton1="Filter"
            userType="Admin"
            userRoles={userRoles}
            filterOptions={userRoles}
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

export default Admin;
