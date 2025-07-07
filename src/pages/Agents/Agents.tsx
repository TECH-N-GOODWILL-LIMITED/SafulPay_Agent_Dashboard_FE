import { useEffect } from "react";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
import type { Agent } from "../../types/types";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";

const tableHeader: string[] = [
  "Name / Business Name",
  "Role",
  "Residual Amount",
  "Phone Number",
  "Status",
];

const Agents: React.FC = () => {
  // ! call the fitlerByRole function to filter agents by role
  const {
    fetchAgents,
    allAgents,
    filterByRole,
    filteredUsers,
    title,
    error,
    loading,
  } = useAllUsers();

  useEffect(() => {
    // fetchAgents();
    filterByRole("Agents");
  }, []);

  const tableData = filteredUsers.map((agent: usersItem) => ({
    id: agent.id,
    image: agent.image || "/images/user/user-12.jpg", // fallback image
    name: agent.name || "N/A",
    firstName: agent.firstname,
    lastName: agent.lastname,
    businessName: agent.business_name || "No Business name",
    username: agent.username || "No username",
    role: agent.type,
    model: agent.model,
    // residualAmount: parseFloat(agent?.residual_amount) || 0.0,
    residualAmount: agent?.residual_amount || 0.0,
    phone: agent.phone || "No Phone number",
    businessPhone: agent.business_phone || "No Business phone",
    address: agent.address,
    latitude: agent.latitude,
    longitude: agent.longitude,
    idType: agent.id_type,
    idDocument: agent.id_document,
    bizRegDocument: agent.bussiness_registration,
    businessImage: agent.bussiness_image,
    status:
      agent.status === 1
        ? "Active"
        : agent.status === 2
        ? "Suspended"
        : agent.status === 3
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
        title="Agents | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency agents - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Agents" />
      <div className="space-y-6">
        <ComponentCard
          title="Agents Table"
          desc="Details of all Agents"
          actionButton1="Filter"
          // onItemClick={filterByRole}
          userType="Agent"
          userRoles={userRoles}
          filterOptions={userRoles}
        >
          <BasicTableOne tableHeading={tableHeader} tableContent={tableData} />
        </ComponentCard>
      </div>
    </>
  );
};

export default Agents;
