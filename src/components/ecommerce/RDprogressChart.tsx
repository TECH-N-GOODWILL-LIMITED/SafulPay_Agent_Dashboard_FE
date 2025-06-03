import React from "react";
import MonthlyTarget from "./MonthlyTarget";

interface progressChartProps {
  title: string;
}

const RDprogressChart: React.FC<progressChartProps> = () => {
  return <MonthlyTarget title="Recollection Progress"></MonthlyTarget>;
};

export default RDprogressChart;
