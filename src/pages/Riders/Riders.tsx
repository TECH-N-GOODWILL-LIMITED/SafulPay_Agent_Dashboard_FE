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
  "Cash in hand",
  "Phone Number",
  "Status",
];

const Riders: React.FC = () => {
  const { title, error, loading, filteredUsers, filterByRole } = useAllUsers();

  useEffect(() => {
    filterByRole("Rider");
  }, [filterByRole]);

  const tableData = filteredUsers?.map((user: usersItem) => ({
    user: {
      id: user.id,
      image: "/images/user/user-20.jpg",
      name: user.name,
      firstName: user.firstname,
      lastName: user.lastname,
      username: user.username || "No username",
      role: user.role,
      cih: 200000,
      phone: user.phone,
      status:
        user.status === 1
          ? "Active"
          : user.status === 2
          ? "Suspended"
          : "Pending",
    },
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
        title="Riders | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency riders - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Riders" />
      <div className="space-y-6">
        <ComponentCard
          title="Riders Table"
          desc="Details of all Riders"
          actionButton1="Filter"
          userType="Rider"
          userRoles={userRoles}
          filterOptions={userRoles}
        >
          <BasicTableOne tableHeading={tableHeader} tableContent={tableData} />
        </ComponentCard>
      </div>
    </>
  );
};

export default Riders;
