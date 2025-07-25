import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import ComponentCard, {
  ActionButtonConfig,
  FilterConfig,
} from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";
import { useAuth } from "../../context/AuthContext";
import { AGENT_ROLE, MERCHANT_ROLE, SUPER_AGENT_ROLE } from "../../utils/roles";

const tableHeader: string[] = [
  "Name / Business Name",
  "Role / Model",
  "Residual Amount",
  "Business Phone / Primary Phone",
  "Status",
  "KYC Status",
];

const Agents: React.FC = () => {
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterModel, setFilterModel] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterKycStatus, setFilterKycStatus] = useState<string>("All");

  const { filterByRole, filteredUsers, title, error, loading } = useAllUsers();
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleOptions = ["All", AGENT_ROLE, SUPER_AGENT_ROLE, MERCHANT_ROLE];
  const modelOptions = ["All", "Target", "Independent"];
  const kycStatusOptions = ["All", "Completed", "Incomplete"];
  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  const vendors = [AGENT_ROLE, SUPER_AGENT_ROLE, MERCHANT_ROLE];

  useEffect(() => {
    filterByRole(vendors);
  }, []);

  const handleAddAgent = () => {
    if (user?.referral_code) {
      navigate(`/onboardagent/${user.referral_code}`);
    }
  };

  const filters: FilterConfig[] = [
    {
      label: `Role: ${filterRole}`,
      options: roleOptions,
      onSelect: (role) => setFilterRole(role),
      value: filterRole,
    },
    {
      label: `Model: ${filterModel}`,
      options: modelOptions,
      onSelect: (model) => setFilterModel(model),
      value: filterModel,
    },
    {
      label: `KYC: ${filterKycStatus}`,
      options: kycStatusOptions,
      onSelect: (status) => setFilterKycStatus(status),
      value: filterKycStatus,
    },
    {
      label: `Status: ${filterStatus}`,
      options: statusOptions,
      onSelect: (status) => setFilterStatus(status),
      value: filterStatus,
    },
  ];

  const actionButton: ActionButtonConfig = {
    label: "Add Agent",
    icon: "✚",
    onClick: handleAddAgent,
  };

  const tableData = useMemo(() => {
    const filteredAgents = filteredUsers.filter((agent: usersItem) => {
      const model = agent.type !== MERCHANT_ROLE ? agent.model : "Independent";
      const status =
        agent.status === 1
          ? "Active"
          : agent.status === 2
          ? "Suspended"
          : agent.status === 3
          ? "Rejected"
          : "Pending";
      const kycStatus = agent.temp === 1 ? "Completed" : "Incomplete";
      const roleMatch = filterRole === "All" || agent.type === filterRole;
      const modelMatch = filterModel === "All" || model === filterModel;
      const statusMatch = filterStatus === "All" || status === filterStatus;
      const kycMatch =
        filterKycStatus === "All" || kycStatus === filterKycStatus;
      return roleMatch && modelMatch && kycMatch && statusMatch;
    });

    return filteredAgents.map((agent: usersItem) => ({
      id: agent.id,
      // image: agent.image || "/images/user/user-12.jpg", // fallback image
      image: agent.image || "/images/user/agent-image.png", // fallback image
      name: agent.name || "N/A",
      firstName: agent.firstname,
      lastName: agent.lastname,
      businessName: agent.business_name || "No Business name",
      username: agent.username || "No username",
      role: agent.type,
      model: agent.type !== MERCHANT_ROLE ? agent.model : "Independent",
      residualAmount: agent?.residual_amount || 0.0,
      phone: agent.phone || "No Phone number",
      businessPhone: agent.business_phone || "No Business phone",
      address: agent.address,
      latitude: agent.latitude,
      longitude: agent.longitude,
      idType: agent.id_type,
      idDocument: agent.id_document,
      bizRegDocument: agent.business_registration,
      businessImage: agent.business_image,
      status:
        agent.status === 1
          ? "Active"
          : agent.status === 2
          ? "Suspended"
          : agent.status === 3
          ? "Rejected"
          : "Pending",
      temp: agent.temp,
      kycStatus: agent.temp === 1 ? "Completed" : "Incomplete",
    }));
  }, [filteredUsers, filterRole, filterModel, filterKycStatus, filterStatus]);

  if (error) {
    return (
      <>
        <PageMeta
          title="Error | SafulPay's Agency Dashboard - Finance just got better"
          description="You are not authorized to view this page."
        />
        <Alert variant="error" title={title} message={error} />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Agents | SafulPay Agency Dashboard - Finance just got better"
        description="List of all agency agents - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Agents & Merchants" />

      {loading ? (
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-6">
          <ComponentCard
            title="Vendors Table"
            desc="Details of all Merchants, Super Agents & Agents"
            filters={filters}
            actionButton={actionButton}
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

export default Agents;
