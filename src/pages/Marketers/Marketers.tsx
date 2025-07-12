import { useEffect } from "react";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { userRoles, ADMIN_ROLE, MARKETER_ROLE } from "../../utils/roles";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";
import { useAuth } from "../../context/AuthContext";
import {
  MarketersProvider,
  useAllMarketers,
} from "../../context/MarketersContext";
import type { UserBio } from "../../types/types";

const tableHeader: string[] = [
  "Name / Username",
  "Role",
  "Code",
  "Phone Number",
  "Status",
];

const AdminView: React.FC = () => {
  const { title, error, loading, filteredUsers, filterByRole } = useAllUsers();

  useEffect(() => {
    filterByRole("Marketer");
  }, [filterByRole]);

  const tableData = filteredUsers?.map((user: usersItem) => ({
    id: user.id,
    image: "/images/user/user-12.jpg", // or actual image URL if available
    name: user.name,
    firstName: user.firstname,
    lastName: user.lastname,
    username: user.username,
    role: user.role,
    code: user.referral_code,
    phone: user.phone,
    status:
      user.status === 1
        ? "Active"
        : user.status === 2
        ? "Suspended"
        : user.status === 3
        ? "Rejected"
        : "Pending",
  }));

  return (
    <>
      {error ? (
        <Alert variant="error" title={title} message={error} showLink={false} />
      ) : loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Marketers Table"
            desc="Details of all Marketers"
            actionButton1="Filter By"
            userType="Marketer"
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

const MarketerView: React.FC = () => {
  const { error, loading, allMarketers } = useAllMarketers();

  const tableData = allMarketers?.map((user: UserBio) => ({
    id: user.id,
    image: user.image || "/images/user/user-12.jpg",
    name: user.name,
    firstName: user.firstname,
    lastName: user.lastname,
    username: user.username,
    role: user.role,
    code: user.referral_code,
    phone: user.phone,
    status:
      user.status === 1
        ? "Active"
        : user.status === 2
        ? "Suspended"
        : user.status === 3
        ? "Rejected"
        : "Pending",
  }));

  return (
    <>
      {error ? (
        <Alert variant="error" title="Error" message={error} showLink={false} />
      ) : loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Marketers Table"
            desc="Details of all Marketers"
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

const Marketers: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <PageMeta
        title="Marketers | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency marketers - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Marketers" />

      {user?.role === ADMIN_ROLE && <AdminView />}
      {user?.role === MARKETER_ROLE && (
        <MarketersProvider>
          <MarketerView />
        </MarketersProvider>
      )}
    </>
  );
};

export default Marketers;
