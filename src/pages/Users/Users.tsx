import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
// import Button from "../../components/ui/button/Button";

interface tableContentType {
  id: number;
  user: {
    image: string;
    name: string;
    businessName: string;
    role: string;
    phone: string;
    status: string;
  };
}

const tableHeader: string[] = [
  "Name/Business Name",
  "Role",
  "Phone Number",
  "Status",
];

const userRoles: string[] = [
  "Admin",
  "Agents",
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
      businessName: "Kandoh Logistics",
      role: "Rider",
      phone: "30200005",
      status: "Active",
    },
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Umaru Kamara",
      businessName: "Ace Enterprise",
      role: "Marketer",
      phone: "80200005",
      status: "Pending",
    },
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Alhaji Kajali",
      businessName: "KJ & Sons",
      role: "Agent",
      phone: "60200005",
      status: "Active",
    },
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Yero Oyinn",
      businessName: "",
      role: "Admin",
      phone: "80200008",
      status: "Active",
    },
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Marcus Otumba",
      businessName: "Otumba & Olori",
      role: "Agent",
      phone: "80200008",
      status: "Suspended",
    },
  },
];

const Users = () => {
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Users" />
      <div className="space-y-6">
        <ComponentCard
          title="Users Table"
          desc="Details of all users with various account types"
          actionButton1="Filter"
          userType="User"
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

export default Users;
