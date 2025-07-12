import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
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

const tableHeader: string[] = [
  "Name / Business Name",
  "Role",
  "Residual Amount",
  "Business Phone / Primary Phone",
  "Status",
  "KYC Status",
];

const MyAgents: React.FC = () => {
  const [filterKycStatus, setFilterKycStatus] = useState<string>("All");
  const [filterRole, setFilterRole] = useState<string>("All");
  const { user } = useAuth();
  const { agents, loading, error, fetchMyAgents } = useMyAgents();
  const navigate = useNavigate();

  const kycStatusOptions = ["All", "Completed", "Incomplete"];
  const roleOptions = ["All", AGENT_ROLE, SUPER_AGENT_ROLE, MERCHANT_ROLE];

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
    const filteredAgents = agents.filter((agent) => {
      const kycStatus = agent.temp === 1 ? "Completed" : "Incomplete";
      const roleMatch = filterRole === "All" || agent.type === filterRole;
      const kycMatch =
        filterKycStatus === "All" || kycStatus === filterKycStatus;
      return roleMatch && kycMatch;
    });

    return filteredAgents.map((agent) => ({
      id: agent.id,
      image: agent.image || "/images/user/user-12.jpg",
      name: agent.name || "N/A",
      firstName: agent.firstname,
      lastName: agent.lastname,
      businessName: agent.business_name || "No Business name",
      username: agent.username || "No username",
      role: agent.type,
      model: agent.model,
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
  }, [agents, filterRole, filterKycStatus]);

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

  // Check if the logged-in user has the allowed role to view this page
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
          // desc="Details of agents & merchants under your referral code"
          actionButton1={`Role: ${filterRole}`}
          actionButton2={`KYC: ${filterKycStatus}`}
          onItemClick={(role) => setFilterRole(role)}
          onItemClick2={(status) => setFilterKycStatus(status)}
          userType={AGENT_ROLE}
          filterOptions={roleOptions}
          filterOptions2={kycStatusOptions}
        >
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
