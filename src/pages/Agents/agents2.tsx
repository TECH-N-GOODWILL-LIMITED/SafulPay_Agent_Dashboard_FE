// import ComponentCard from "../../components/common/ComponentCard";
// import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import PageMeta from "../../components/common/PageMeta";
// import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

// interface tableContentType {
//   user: {
//     id: number;
//     image: string;
//     name: string;
//     businessName: string;
//     role: string;
//     cih: number;
//     phone: string;
//     status: string;
//   };
// }

// const tableHeader: string[] = [
//   "Name/Business name",
//   "Role",
//   "Cash in Hand",
//   "Phone Number",
//   "Status",
// ];

// const userRoles: string[] = [
//   "Admin",
//   "Agent",
//   "Marketer",
//   "Rider",
//   "Accountant",
// ];

// const tableContent: tableContentType[] = [
//   {
//     user: {
//       id: 1,
//       image: "/images/user/user-17.jpg",
//       name: "Barry AbdulRahim",
//       businessName: "Kandoh Logistics",
//       role: "Agent",
//       cih: 20000,
//       phone: "30200005",
//       status: "Active",
//     },
//   },
//   {
//     user: {
//       id: 2,
//       image: "/images/user/user-18.jpg",
//       name: "Umaru Kamara",
//       businessName: "Ace Enterprise",
//       role: "Agent",
//       cih: 1500,
//       phone: "80200005",
//       status: "Active",
//     },
//   },
//   {
//     user: {
//       id: 3,
//       image: "/images/user/user-17.jpg",
//       name: "Alhaji Kajalie",
//       businessName: "KJ & Sons",
//       role: "Agent",
//       cih: 10,
//       phone: "60200005",
//       status: "Pending",
//     },
//   },
//   {
//     user: {
//       id: 4,
//       image: "/images/user/user-20.jpg",
//       name: "Yero Oyinn",
//       businessName: "",
//       role: "Agent",
//       cih: 30330,
//       phone: "80200008",
//       status: "Active",
//     },
//   },
//   {
//     user: {
//       id: 5,
//       image: "/images/user/user-21.jpg",
//       name: "Marcus Otumba",
//       businessName: "Otumba & Olori",
//       role: "Agent",
//       cih: 10,
//       phone: "80200008",
//       status: "Suspended",
//     },
//   },
// ];

// const Agents = () => {
//   return (
//     <>
//       <PageMeta
//         title="SafulPay Agency Dashboard | Finance just got better"
//         description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
//       />
//       <PageBreadcrumb pageTitle="Agents" />
//       <div className="space-y-6">
//         <ComponentCard
//           title="Agents Table"
//           desc="Details of all Agents"
//           actionButton1="Filter"
//           userType="Agent"
//           userRoles={userRoles}
//         >
//           <BasicTableOne
//             tableHeading={tableHeader}
//             tableContent={tableContent}
//           />
//         </ComponentCard>
//       </div>
//     </>
//   );
// };

// export default Agents;

import { useAllUsers } from "../../context/UsersContext";
import { userRoles } from "../../utils/roles";
import type { Agent } from "../../types/types";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Alert from "../../components/ui/alert/Alert";
import { useEffect } from "react";

interface TableContentType {
  user: {
    id: number;
    image?: string;
    name: string;
    businessName?: string;
    role: string;
    residualAmount: number;
    phone: string;
    status: string;
  };
}

const tableHeader: string[] = [
  "Name/Business Name",
  "Role",
  "Residual Amount",
  "Phone Number",
  "Status",
];

const Agents: React.FC = () => {
  const { fetchAgents, allAgents, title, error, loading } = useAllUsers();

  useEffect(() => {
    fetchAgents();
  }, []);

  const tableData: TableContentType[] = allAgents.map((agent: Agent) => ({
    user: {
      id: agent.id,
      image: agent.marketer?.image || "/images/user/user-12.jpg", // fallback image
      name: agent.marketer?.name || "N/A",
      businessName: agent.business_name,
      role: "Agent", // or derive from marketer.role if available
      residualAmount: parseFloat(agent?.residual_amount) || 0,
      phone: agent.phone || "No phone number",
      status:
        agent.status === "1"
          ? "Active"
          : agent.status === "2"
          ? "Pending"
          : "Suspended",
    },
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
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Users" />
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
