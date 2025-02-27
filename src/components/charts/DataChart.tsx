
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface DataChartProps {
  data: any[];
  title?: string;
  chartType: 'bar' | 'bar3d' | 'pie';
}

const COLORS = {
  sdwan: '#2691A4',
  ipflex: '#36B9D3',
  hisae: '#74DFF2'
};

// Utility function to format numbers with commas and decimals
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const DataChart = ({ data, title, chartType }: DataChartProps) => {
  if (!data || data.length === 0) {
    return null;
  }

  const handleClick = (e: any) => {
    if (e && e.event) {
      e.event.preventDefault();
      e.event.stopPropagation();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        const pieData = Object.entries(COLORS).map(([key]) => ({
          name: key.toUpperCase(),
          value: data.reduce((sum, item) => sum + (item[key] || 0), 0)
        })).filter(item => item.value > 0);
        
        return (
          <PieChart width={400} height={400} onClick={handleClick}>
            <Pie
              data={pieData}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, value }) => `${name} ${formatNumber(value)}`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>
                {value}: {formatNumber(pieData.find(item => item.name === value)?.value || 0)}
              </span>
            )} />
          </PieChart>
        );
      case 'bar3d':
      case 'bar':
        return (
          <BarChart
            data={data}
            onClick={handleClick}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(value) => value.toUpperCase()} />
            {Object.entries(COLORS).map(([key, color]) => (
              data.some(item => item[key]) && (
                <Bar
                  key={key}
                  dataKey={key}
                  name={key.toUpperCase()}
                  stackId="stack"
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              )
            ))}
          </BarChart>
        );
    }
  };

  return (
    <Card className="p-6 border border-[#2691A4]/10 bg-white/50 backdrop-blur-sm">
      {title && <h3 className="mb-6 text-lg font-semibold text-gray-700">{title}</h3>}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
