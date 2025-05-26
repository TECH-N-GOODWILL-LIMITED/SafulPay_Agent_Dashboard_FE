import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

interface tableContentType {
  id: number;
  user: {
    image: string;
    name: string;
    // businessName: string;
    // code: string;
    // cih: number;
    phone: string;
    status: string;
  };
}

const tableHeader: string[] = ["Name", " ", "Phone Number", "Status"];

const userRoles: string[] = [
  "Admin",
  "Agent",
  "Marketer",
  "Rider",
  "Accountant",
];

const tableContent: tableContentType[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Barry AbdulRahim",
      // businessName: "Kandoh Logistics",
      phone: "30200005",
      status: "Active",
    },
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Umaru Kamara",
      // businessName: "Ace Enterprise",
      phone: "80200005",
      status: "Active",
    },
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Alhaji Kajalie",
      // businessName: "KJ & Sons",
      phone: "60200005",
      status: "Active",
    },
  },
];

const Admin = () => {
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Admins" />
      <div className="space-y-6">
        <ComponentCard
          title="Admins Table"
          desc="Details of all Admins"
          actionButton1="Filter"
          userType="Admin"
          userRoles={userRoles}
          filterOptions={userRoles}
        >
          <BasicTableOne
            tableHeading={tableHeader}
            tableContent={tableContent}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default Admin;
