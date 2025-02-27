
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
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

  const ChartComponent = data.length < 3 ? BarChart : AreaChart;
  console.log('Using chart type:', ChartComponent.name);

  const gradientId = "colorGradient";

  return (
    <Card className="p-6 border border-[#2691A4]/10 bg-white/50 backdrop-blur-sm">
      {title && <h3 className="mb-6 text-lg font-semibold text-gray-700">{title}</h3>}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2691A4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2691A4" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            {data.length < 3 ? (
              <Bar 
                dataKey="value" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
            ) : (
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2691A4"
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

