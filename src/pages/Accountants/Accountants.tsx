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
    name: string;
    role: string;
    cih: number;
    phone: string;
    status: string;
  };
}

const tableHeader: string[] = [
  "Name",
  "Role",
  "Cash in hand",
  "Phone Number",
  "Status",
];

const Accountants: React.FC = () => {
  const { title, error, loading, filteredUsers, filterByRole } = useAllUsers();

  useEffect(() => {
    filterByRole("Accountant");
  }, [filterByRole]);

  const tableData: TableContentType[] = filteredUsers?.map(
    (user: usersItem) => ({
      user: {
        id: user.id,
        image: "/images/user/user-17.jpg", // or actual image URL if available
        name: user.name,
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
    })
  );

  if (loading) return <div>Loading...</div>;
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
      <PageBreadcrumb pageTitle="Accountants" />
      <div className="space-y-6">
        <ComponentCard
          title="Accountants Table"
          desc="Details of all Accountants"
          actionButton1="Filter"
          userType="Accountant"
          userRoles={userRoles}
          filterOptions={userRoles}
        >
          <BasicTableOne tableHeading={tableHeader} tableContent={tableData} />
        </ComponentCard>
      </div>
    </>
  );
};

export default Accountants;
