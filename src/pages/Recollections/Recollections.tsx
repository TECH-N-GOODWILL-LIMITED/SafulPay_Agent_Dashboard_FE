import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

interface tableContentType {
  id: number;
  user: {
    image: string;
    name: string;
    // businessName: string;
    // code: string;
    cih: number;
    phone: string;
    status: string;
  };
}

const tableContent: tableContentType[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Barry AbdulRahim",
      // businessName: "Kandoh Logistics",
      cih: 20000,
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
      cih: 1500,
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
      cih: 17050,
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
      cih: 30330,
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
      cih: 150,
      phone: "80200008",
      status: "Suspended",
    },
  },
];

export default function Recollections() {
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Recollections" />
      <div className="space-y-6">
        <ComponentCard title="Recollection">
          <BasicTableOne tableContent={tableContent} />
        </ComponentCard>
      </div>
    </>
  );
}
