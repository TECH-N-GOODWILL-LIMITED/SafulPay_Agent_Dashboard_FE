import { useEffect } from "react";
import { useAllUsers } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
import type { UserBio } from "../../types/types";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

interface TableContentType {
  user: {
    id: number;
    image?: string;
    name: string;
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

const Users = () => {
  // const [tableContent, setTableContent] = useState<TableContentType[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const { allUsers, fetchUsers, error, loading } = useAllUsers();

  useEffect(() => {
    fetchUsers();
  }, []);

  const tableData: TableContentType[] = allUsers.map((user: UserBio) => ({
    user: {
      id: user.id,
      image: "/images/user/user-17.jpg", // or actual image URL if available
      name: user.name,
      businessName: "", // add if your API provides it
      role: user.role,
      phone: user.phone,
      status:
        user.status === 1
          ? "Active"
          : user.status === 2
          ? "Pending"
          : "Suspended",
    },
  }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
          userType="User"
          userRoles={userRoles}
          filterOptions={userRoles}
        >
          <BasicTableOne tableHeading={tableHeader} tableContent={tableData} />
        </ComponentCard>
      </div>
    </>
  );
};

export default Users;
