import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { useAuth } from "../../context/AuthContext";
import { useAllUsers, usersItem } from "../../context/UsersContext";
import { ChevronDownIcon } from "../../icons";
import { MARKETER_ROLE, ADMIN_ROLE } from "../../utils/roles";

const tableHeader: string[] = [
  "Name / Business Name",
  "Role",
  "Residual Amount",
  "Phone Number",
  "Status",
  "KYC Status",
];

const MyAgents: React.FC = () => {
  const { user, token } = useAuth();
  const { myAgents, loading, error, fetchMyAgents } = useAllUsers();
  const [filterKycStatus, setFilterKycStatus] = useState<string>("All");
  const [isKycDropdownOpen, setIsKycDropdownOpen] = useState<boolean>(false);

  const kycStatusOptions = ["All", "Completed", "Incomplete"];

  useEffect(() => {
    if (token && user?.referral_code) {
      fetchMyAgents(user.referral_code);
    }
  }, [token, user?.referral_code, fetchMyAgents]);

  const myAgentsData = useMemo(() => {
    const filteredByKyc = myAgents.filter((agent) => {
      const kycStatus = agent.temp === 1 ? "Completed" : "Incomplete";
      if (filterKycStatus === "All") return true;
      return kycStatus === filterKycStatus;
    });

    return filteredByKyc.map((agent: usersItem) => ({
      id: agent.id,
      image: agent.image || "/images/user/user-12.jpg", // fallback image
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
  }, [myAgents, filterKycStatus]);

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
  if (!user || (user.role !== MARKETER_ROLE && user.role !== ADMIN_ROLE)) {
    return (
      <Alert
        variant="error"
        title="Unauthorized Access"
        message="You do not have permission to view this page."
        showLink={true}
        linkText="Go to Dashboard"
        linkHref="/"
      />
    );
  }

  return (
    <>
      <PageMeta
        title="My Agents | SafulPay Agency Dashboard"
        description="List of agents under this marketer's referral code."
      />
      <PageBreadcrumb pageTitle="My Agents" />
      <div className="space-y-6">
        <ComponentCard
          title="My Agents Table"
          desc="Details of agents under your referral code"
        >
          <div className="flex justify-end mb-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by KYC Status</label>
              <div
                className={`relative h-11 w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 bg-transparent shadow-theme-xs flex items-center justify-between cursor-pointer  dark:text-white/90 border-gray-300 dark:border-gray-700 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/20`}
                onClick={() => setIsKycDropdownOpen(!isKycDropdownOpen)}
              >
                <span>{filterKycStatus}</span>
                <ChevronDownIcon className="w-4 h-4 text-gray-800 dark:text-white/90" />
              </div>
              <Dropdown
                isOpen={isKycDropdownOpen}
                onClose={() => setIsKycDropdownOpen(false)}
                className="w-full p-2"
                search={false}
              >
                {kycStatusOptions.map((option) => (
                  <DropdownItem
                    key={option}
                    onItemClick={() => {
                      setFilterKycStatus(option);
                      setIsKycDropdownOpen(false);
                    }}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    {option}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          </div>
          <BasicTableOne tableHeading={tableHeader} tableContent={myAgentsData} />
        </ComponentCard>
      </div>
    </>
  );
};

export default MyAgents;
