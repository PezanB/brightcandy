
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

  return (
    <Card className="p-4">
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {data.length < 3 ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                type="monotone"
                dataKey="value"
                fill="#8884d8"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ stroke: '#8884d8', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
