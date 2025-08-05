import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard, {
  ActionButtonConfig,
} from "../../components/common/ComponentCard";
import { FilterConfig } from "../../components/common/TableFilters";
import TableFilters from "../../components/common/TableFilters";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";
import { useAuth } from "../../context/AuthContext";
import { useMyAgents } from "../../context/MyAgentsContext";
import {
  MARKETER_ROLE,
  ADMIN_ROLE,
  AGENT_ROLE,
  SUPER_AGENT_ROLE,
  MERCHANT_ROLE,
} from "../../utils/roles";
import AgentsStatsCard from "../../components/common/AgentStatsCard";
import { Agent } from "../../types/types";

const tableHeader: string[] = [
  "Name / Business Name",
  "Role / Model",
  "Residual Amount",
  "Business Phone / Primary Phone",
  "Status",
  "KYC Status",
];

const MyAgents: React.FC = () => {
  const [filterKycStatus, setFilterKycStatus] = useState<string>("All");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterModel, setFilterModel] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const { user } = useAuth();
  const { agents, loading, error, fetchMyAgents } = useMyAgents();
  const navigate = useNavigate();

  const roleOptions = ["All", AGENT_ROLE, SUPER_AGENT_ROLE, MERCHANT_ROLE];
  const modelOptions = ["All", "Target", "Independent"];
  const kycStatusOptions = ["All", "Completed", "Incomplete"];
  const statusOptions = ["All", "Pending", "Active", "Suspended", "Rejected"];

  const handleAddAgent = () => {
    if (user?.referral_code) {
      navigate(`/onboardagent/${user.referral_code}`);
    }
  };

  const filters: FilterConfig[] = [
    {
      label: `Role: ${filterRole}`,
      options: roleOptions,
      onSelect: (role: string) => setFilterRole(role),
      value: filterRole,
    },
    {
      label: `Model: ${filterModel}`,
      options: modelOptions,
      onSelect: (model: string) => setFilterModel(model),
      value: filterModel,
    },
    {
      label: `KYC: ${filterKycStatus}`,
      options: kycStatusOptions,
      onSelect: (status: string) => setFilterKycStatus(status),
      value: filterKycStatus,
    },
    {
      label: `Status: ${filterStatus}`,
      options: statusOptions,
      onSelect: (status: string) => setFilterStatus(status),
      value: filterStatus,
    },
  ];

  const actionButton: ActionButtonConfig = {
    label: "Add Agent",
    onClick: handleAddAgent,
  };

  const isUnauthorized =
    !user || (user.role !== MARKETER_ROLE && user.role !== ADMIN_ROLE);

  useEffect(() => {
    if (!loading && isUnauthorized) {
      const timer = setTimeout(() => {
        navigate("/unauthorized");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isUnauthorized, navigate]);

  useEffect(() => {
    fetchMyAgents();
  }, [fetchMyAgents]);

  const myAgentsData = useMemo(() => {
    const filteredAgents = agents.filter((agent: Agent) => {
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

    return filteredAgents.map((agent: Agent) => ({
      id: agent.id,
      image: agent.image || "/images/user/agent-image.png",
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
  }, [agents, filterRole, filterModel, filterKycStatus, filterStatus]);

  if (loading) {
    return (
      <div className="text-gray-500 dark:text-gray-400">Loading agents...</div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error" message={error} showLink={false} />
    );
  }

  if (isUnauthorized) {
    return (
      <>
        <PageMeta
          title="Unauthorized Access | SafulPay's Agency Dashboard - Finance just got better"
          description="You are not authorized to view this page."
        />
        <Alert
          variant="error"
          title="Unauthorized Access"
          message="You do not have permission to edit this agent. Redirecting..."
        />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="My Agents & Merchants | SafulPay Agency Dashboard"
        description="List of agents under this marketer's referral code."
      />
      <PageBreadcrumb pageTitle="My Agents & Merchants" />

      <div className="space-y-6 sm:space-y-6">
        <AgentsStatsCard statsData={agents} />
        <ComponentCard
          title="My Agents Table"
          desc="Details of agents & merchants under your referral code"
          actionButton={actionButton}
        >
          <TableFilters filters={filters} />
          <BasicTableOne
            tableHeading={tableHeader}
            tableContent={myAgentsData}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default MyAgents;
