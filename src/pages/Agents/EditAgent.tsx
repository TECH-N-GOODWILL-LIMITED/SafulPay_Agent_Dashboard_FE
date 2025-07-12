import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import EditAgentForm from "../../components/auth/EditAgentForm";
import Alert from "../../components/ui/alert/Alert";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useMyAgents } from "../../context/MyAgentsContext";

export default function EditAgent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agents, loading, fetchMyAgents } = useMyAgents();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetchMyAgents();
  }, [fetchMyAgents]);

  useEffect(() => {
    if (!loading) {
      if (agents.length > 0) {
        const agentExists = agents.some((agent) => agent.id.toString() === id);
        setIsAuthorized(agentExists);

        if (!agentExists) {
          const timer = setTimeout(() => {
            navigate("/unauthorized");
          }, 2000);
          return () => clearTimeout(timer);
        }
      } else {
        // If there are no agents after loading, they can't be authorized for any agent.
        setIsAuthorized(false);
        const timer = setTimeout(() => {
          navigate("/unauthorized");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, agents, id, navigate]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
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
        title="Agent & Merchant | SafulPay Agency Dashboard - Finance just got better"
        description="Update an Agent or Merchant Info - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Edit Agent & Merchant" />
      <EditAgentForm />
    </>
  );
}
