import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import { getAllUsers } from "../../utils/api";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/ui/alert/Alert";

interface tableContentType {
  id: number;
  user: {
    image: string;
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

const userRoles: string[] = [
  "Admin",
  "Agents",
  "Marketer",
  "Rider",
  "Accountant",
];

const Users = () => {
  const [tableContent, setTableContent] = useState<tableContentType[]>([]);
  const [error, setError] = useState("");
  const { accessToken, clearToken } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!accessToken) {
        navigate("/signin");
        return;
      }

      try {
        const response = await getAllUsers(accessToken);
        if (response.success && response.data) {
          const users = response.data.users.map((user) => ({
            id: user.id,
            user: {
              image: "/images/user/user-placeholder.jpg",
              name: user.name,
              businessName: "",
              role: user.role,
              phone: user.phone,
              status: user.status === 1 ? "Active" : "Inactive",
            },
          }));
          setTableContent(users);
        } else {
          setError(response.error || "Failed to fetch users.");
          if (response.error?.includes("Session expired")) {
            clearToken();
            navigate("/signin");
          }
        }
      } catch (err) {
        setError(`Error fetching users: ${err}`);
      }
    };

    fetchUsers();
  }, [accessToken, navigate, clearToken]);

  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Users" />
      <div className="space-y-6">
        {error && (
          <Alert
            variant="error"
            title="Error"
            message={error}
            showLink={false}
          />
        )}
        <ComponentCard
          title="Users Table"
          desc="Details of all users with various account types"
          actionButton1="Filter"
          userType="User"
          userRoles={userRoles}
          filterOptions={userRoles}
        >
          <BasicTableOne
            tableHeading={tableHeader}
            tableContent={tableContent}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default Users;
