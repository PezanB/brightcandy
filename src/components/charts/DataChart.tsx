
import { Card } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface DataChartProps {
  data: ChartData[];
  title?: string;
}

export const DataChart = ({ data, title }: DataChartProps) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Use BarChart for fewer than 3 data points, LineChart for 3 or more
  const ChartComponent = data.length < 3 ? BarChart : LineChart;
  const DataComponent = data.length < 3 ? Bar : Line;

  return (
    <Card className="p-4">
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <DataComponent
              type="monotone"
              dataKey="value"
              fill="#8884d8"
              stroke="#8884d8"
              strokeWidth={2}
              dot={data.length >= 3 ? { stroke: '#8884d8', strokeWidth: 2 } : undefined}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
