import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import EditAgentForm from "../../components/auth/EditAgentForm";
import Alert from "../../components/ui/alert/Alert";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import { ADMIN_ROLE } from "../../utils/roles";
import { getAgentById } from "../../utils/api";

export default function EditAgent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authorizeAccess = async () => {
      if (!token || !id || !authUser) {
        setLoading(false);
        setIsAuthorized(false);
        setError("Authentication details are missing.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getAgentById(token, id);

        if (!response.success || !response.data) {
          setIsAuthorized(false);
          setError("Agent not found or failed to fetch data.");
          setLoading(false);
          return;
        }

        const agent = response.data.agent;

        if (authUser.role === ADMIN_ROLE) {
          setIsAuthorized(true);
        } else {
          if (agent.ref_by === authUser.referral_code) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            setError("You are not authorized to edit this agent.");
          }
        }
      } catch (err) {
        console.error("Error during authorization check:", err);
        setIsAuthorized(false);
        setError("An unexpected error occurred during authorization.");
      } finally {
        setLoading(false);
      }
    };

    authorizeAccess();
  }, [id, authUser, token]);

  useEffect(() => {
    if (isAuthorized === false) {
      const timer = setTimeout(() => {
        navigate("/unauthorized");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthorized, navigate]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          Verifying authorization...
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
          message={
            error ||
            "You do not have permission to edit this agent. Redirecting..."
          }
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
