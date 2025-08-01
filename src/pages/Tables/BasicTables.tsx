import PageBreadcrumb from "../../components/common/PageBreadCrumb";
// import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
// import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

// interface Order {
//   id: number;
//   user: {
//     image: string;
//     name: string;
//     role: string;
//   };
//   projectName: string;
//   team: {
//     images: string[];
//   };
//   status: string;
//   budget: string;
// }

// const tableData /*: Order[]*/ = [
//   {
//     id: 1,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Lindsey Curtis",
//       role: "Web Designer",
//     },
//     projectName: "Agency Website",
//     team: {
//       images: [
//         "/images/user/user-22.jpg",
//         "/images/user/user-23.jpg",
//         "/images/user/user-24.jpg",
//       ],
//     },
//     budget: "3.9K",
//     status: "Active",
//   },
//   {
//     id: 2,
//     user: {
//       image: "/images/user/user-18.jpg",
//       name: "Kaiya George",
//       role: "Project Manager",
//     },
//     projectName: "Technology",
//     team: {
//       images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
//     },
//     budget: "24.9K",
//     status: "Pending",
//   },
//   {
//     id: 3,
//     user: {
//       image: "/images/user/user-17.jpg",
//       name: "Zain Geidt",
//       role: "Content Writing",
//     },
//     projectName: "Blog Writing",
//     team: {
//       images: ["/images/user/user-27.jpg"],
//     },
//     budget: "12.7K",
//     status: "Active",
//   },
//   // {
//   //   id: 4,
//   //   user: {
//   //     image: "/images/user/user-20.jpg",
//   //     name: "Abram Schleifer",
//   //     role: "Digital Marketer",
//   //   },
//   //   projectName: "Social Media",
//   //   team: {
//   //     images: [
//   //       "/images/user/user-28.jpg",
//   //       "/images/user/user-29.jpg",
//   //       "/images/user/user-30.jpg",
//   //     ],
//   //   },
//   //   budget: "2.8K",
//   //   status: "Cancel",
//   // },
//   // {
//   //   id: 5,
//   //   user: {
//   //     image: "/images/user/user-21.jpg",
//   //     name: "Carla George",
//   //     role: "Front-end Developer",
//   //   },
//   //   projectName: "Website",
//   //   team: {
//   //     images: [
//   //       "/images/user/user-31.jpg",
//   //       "/images/user/user-32.jpg",
//   //       "/images/user/user-33.jpg",
//   //     ],
//   //   },
//   //   budget: "4.5K",
//   //   status: "Active",
//   // },
// ];

export default function BasicTables() {
  return (
    <>
      <PageMeta
        title="SafulPay Agency Dashboard | Finance just got better"
        description="This is SafulPay Agency's Dashboard - Management system for SafulPay's Agency Platform"
      />
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        {/* <ComponentCard title="Basic Table 1"> */}
        {/* <BasicTableOne tableContent={tableData} /> */}
        {/* </ComponentCard> */}
      </div>
    </>
  );
}
