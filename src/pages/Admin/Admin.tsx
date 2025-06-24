import { useEffect } from "react";
import { useAllUsers } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
import type { Agent, UserBio } from "../../types/types";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";

interface AgentWithRole extends Agent {
  role: string; // set to "Agent"
}
type usersItem = UserBio | AgentWithRole;

interface TableContentType {
  user: {
    id: number;
    image?: string;
    name?: string;
    role: string;
    phone: string;
    status: string;
  };
}

const tableHeader: string[] = ["Name", "Role", "Phone Number", "Status"];

const Admin = () => {
  const { title, error, loading, filteredUsers, filterByRole } = useAllUsers();

  useEffect(() => {
    filterByRole("Admin");
  }, [filterByRole]);

  const tableData: TableContentType[] = filteredUsers?.map(
    (user: usersItem) => ({
      user: {
        id: user.id,
        image: "/images/user/user-07.jpg", // or actual image URL if available
        name: user.name,
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
        title="Admins | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency admins - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Admins" />
      <div className="space-y-6">
        <ComponentCard
          title="Admins Table"
          desc="Details of all Admins"
          actionButton1="Filter"
          userType="Admin"
          userRoles={userRoles}
          filterOptions={userRoles}
        >
          <BasicTableOne tableHeading={tableHeader} tableContent={tableData} />
        </ComponentCard>
      </div>
    </>
  );
};

export default Admin;
