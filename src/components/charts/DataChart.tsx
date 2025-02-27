
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

// Generate a color palette for dynamic number of categories
const generateColor = (index: number) => {
  const baseColors = ['#2691A4', '#36B9D3', '#74DFF2', '#1A6B78', '#5ACBE0', '#A3E8F4'];
  return baseColors[index % baseColors.length];
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

  // Get all numeric fields from the data except 'name'
  const numericFields = Object.keys(data[0]).filter(key => 
    key !== 'name' && typeof data[0][key] === 'number'
  );

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
        // For pie chart, sum up values for each metric across all entries
        const pieData = numericFields.map((field, index) => ({
          name: field.toUpperCase(),
          value: data.reduce((sum, item) => sum + (item[field] || 0), 0),
          color: generateColor(index)
        }));
        
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
                <Cell key={`cell-${index}`} fill={entry.color} />
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
            {numericFields.map((field, index) => (
              <Bar
                key={field}
                dataKey={field}
                name={field.toUpperCase()}
                stackId="stack"
                fill={generateColor(index)}
                radius={[4, 4, 0, 0]}
              />
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
