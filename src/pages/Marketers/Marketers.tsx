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
    code: string;
    phone: string;
    status: string;
  };
}

const tableHeader: string[] = ["Name", "Code", "Phone Number", "Status"];

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
      code: "AJBFF2873",
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
      code: "AUIYB2873BU2",
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
      code: "AAHHE78243B289",
      phone: "60200005",
      status: "Active",
    },
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Yero Oyinn",
      // businessName: "",
      code: "AAIAJ826313",
      phone: "80200008",
      status: "Active",
    },
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Marcus Otumba",
      // businessName: "Otumba & Olori",
      code: "AAGYAB7216b2",
      phone: "80200008",
      status: "Suspended",
    },
  },
];

const Marketers = () => {
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Marketers" />
      <div className="space-y-6">
        <ComponentCard
          title="Marketers Table"
          desc="Details of all Marketers"
          actionButton1="Filter"
          userType="Marketer"
          userRoles={userRoles}
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

export default Marketers;
