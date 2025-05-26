import React from "react";
import MonthlyTarget from "./MonthlyTarget";

interface progressChartProps {
  title: string;
  //   progress: number;
}

// const progressChartData: progressChartProps[] = [
//   {
//     title: "well well true",
//     // user: {
//     //   image: "/images/user/user-17.jpg",
//     //   name: "Barry AbdulRahim",
//     //   // businessName: "Kandoh Logistics",
//     //   cih: 20000,
//     //   phone: "30200005",
//     //   status: "Active",
//     // },
//   },

const RDprogressChart: React.FC<progressChartProps> = () => {
  return <MonthlyTarget title="Recollection Progress"></MonthlyTarget>;
};

export default RDprogressChart;
