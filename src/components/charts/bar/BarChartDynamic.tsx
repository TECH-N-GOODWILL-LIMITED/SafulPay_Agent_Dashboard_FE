import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface BarChartDynamicProps {
  options: ApexOptions;
  series: {
    name: string;
    data: number[];
  }[];
  height?: number;
}

const BarChartDynamic: React.FC<BarChartDynamicProps> = ({
  options,
  series,
  height = 180,
}) => {
  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[1000px]">
        <Chart options={options} series={series} type="bar" height={height} />
      </div>
    </div>
  );
};

export default BarChartDynamic;
