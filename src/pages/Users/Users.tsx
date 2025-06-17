import { useEffect } from "react";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne, {
  TableContentItem,
} from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";
import { UserBio, Agent, Role } from "../../types/types";

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
  }, [fetchUsers]);

  const userOptions = [...userRoles, "All Users"];

  const tableData: TableContentItem[] = filteredUsers.map((user: usersItem) => {
    const baseUser: UserBio = {
      id: user.id,
      image: user.image,
      name: user.name,
      firstname: user.firstname,
      lastname: user.lastname,
      business_name: user.business_name,
      username: user.username,
      phone: user.phone,
      email: user.email || "N/A",
      country_code: user.country_code,
      created_at: user.created_at,
      updated_at: user.updated_at,
      status: user.status,
      role: user.role as Role,
      address: "address" in user ? user.address : undefined,
    };

    return {
      user:
        user.role === "Agent"
          ? {
              ...baseUser,
              master_id: (user as Agent).master_id,
              model: (user as Agent).model,
              category: (user as Agent).category,
              threshold_wallet_balance: (user as Agent)
                .threshold_wallet_balance,
              threshold_cash_in_hand: (user as Agent).threshold_cash_in_hand,
              residual_amount: (user as Agent).residual_amount,
              latitude: (user as Agent).latitude,
              longitude: (user as Agent).longitude,
              marketer: (user as Agent).marketer,
            }
          : baseUser,
    };
  });

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
