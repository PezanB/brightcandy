
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
  console.log('DataChart received data:', data);

  if (!data || data.length === 0) {
    console.log('No data provided to DataChart');
    return null;
  }

  const ChartComponent = data.length < 3 ? BarChart : LineChart;
  console.log('Using chart type:', ChartComponent.name);

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
            {data.length < 3 ? (
              <Bar dataKey="value" fill="#8884d8" />
            ) : (
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ stroke: '#8884d8', strokeWidth: 2 }}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
