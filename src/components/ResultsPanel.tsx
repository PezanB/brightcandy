
import { Card } from "@/components/ui/card";
import { DataChart } from "@/components/charts/DataChart";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ResultsPanelProps {
  chartData?: any[] | null;
}

// Utility function to format numbers with commas and decimals
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const ResultsPanel = ({ chartData }: ResultsPanelProps) => {
  const [activeChartType, setActiveChartType] = useState<'bar' | 'bar3d' | 'pie'>('bar');

  const handleChartTypeChange = (type: 'bar' | 'bar3d' | 'pie') => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveChartType(type);
  };

  // If there's no data to display, show a placeholder message
  if (!chartData) {
    return (
      <div className="h-full">
        <Card className="h-full rounded-none border-none bg-[#F9F9F9] flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-[#2691A4] to-[#36B9D3] bg-clip-text text-transparent mb-4">
              Welcome to Sales Analytics
            </h2>
            <p className="text-gray-600 mb-2">
              No data is currently being displayed. Try asking about sales data insights or uploading your data to get started.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Get all numeric fields from the data
  const numericFields = Object.keys(chartData[0]).filter(key => 
    key !== 'name' && typeof chartData[0][key] === 'number'
  );

  // Calculate total values for each item
  const getTotalForItem = (item: any) => {
    return numericFields.reduce((total, field) => total + (item[field] || 0), 0);
  };

  return (
    <div className="h-full">
      <Card className="h-full rounded-none border-none bg-[#F9F9F9]">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto px-4">
            <div className="flex items-center justify-between mb-4 pt-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#2691A4] to-[#36B9D3] bg-clip-text text-transparent">
                Current Results
              </h2>
              <div className="flex gap-1">
                <Button
                  variant={activeChartType === 'bar' ? 'default' : 'outline'}
                  onClick={handleChartTypeChange('bar')}
                  className="bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity"
                  size="sm"
                >
                  Bar Chart
                </Button>
                <Button
                  variant={activeChartType === 'bar3d' ? 'default' : 'outline'}
                  onClick={handleChartTypeChange('bar3d')}
                  className="bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity"
                  size="sm"
                >
                  3D Bar Chart
                </Button>
                <Button
                  variant={activeChartType === 'pie' ? 'default' : 'outline'}
                  onClick={handleChartTypeChange('pie')}
                  className="bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity"
                  size="sm"
                >
                  Pie Chart
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
              {chartData.map((item, index) => (
                <Card 
                  key={index} 
                  className="p-2 border border-[#2691A4]/10 bg-gradient-to-br from-white to-[#F8FDFE] backdrop-blur-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="text-xs text-gray-600">{item.name}</div>
                  <div className="text-sm font-bold bg-gradient-to-r from-[#2691A4] to-[#36B9D3] bg-clip-text text-transparent">
                    {formatNumber(getTotalForItem(item))}
                  </div>
                </Card>
              ))}
            </div>
            <DataChart 
              data={chartData}
              title="Current Data Analysis"
              chartType={activeChartType}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
