
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
  Legend,
  CategoricalChartState
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

export const DataChart = ({ data, title, chartType }: DataChartProps) => {
  if (!data || data.length === 0) {
    return null;
  }

  const handleClick = (state: CategoricalChartState) => {
    if (state && state.event) {
      state.event.preventDefault();
      state.event.stopPropagation();
    }
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
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
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
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
