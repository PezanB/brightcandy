
import { Card } from "@/components/ui/card";
import { DataChart } from "@/components/charts/DataChart";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChartData {
  name: string;
  value: number;
}

interface ResultsPanelProps {
  chartData?: ChartData[] | null;
}

export const ResultsPanel = ({ chartData }: ResultsPanelProps) => {
  const [activeChartType, setActiveChartType] = useState<'bar' | 'bar3d' | 'pie'>('bar');
  
  // Sample data for 12 months
  const sampleData = [
    { name: "January", value: 420 },
    { name: "February", value: 380 },
    { name: "March", value: 550 },
    { name: "April", value: 480 },
    { name: "May", value: 620 },
    { name: "June", value: 780 },
    { name: "July", value: 850 },
    { name: "August", value: 790 },
    { name: "September", value: 680 },
    { name: "October", value: 540 },
    { name: "November", value: 480 },
    { name: "December", value: 590 }
  ];

  const hasValidData = chartData && Array.isArray(chartData) && chartData.length > 0;
  const displayData = hasValidData ? chartData : sampleData;

  return (
    <div className="h-full">
      <Card className="h-full rounded-none border-none bg-gradient-to-br from-[#F9F9F9] to-[#EDF7F9]">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#2691A4] to-[#36B9D3] bg-clip-text text-transparent">Monthly Results</h2>
              <div className="flex gap-2">
                <Button
                  variant={activeChartType === 'bar' ? 'default' : 'outline'}
                  onClick={() => setActiveChartType('bar')}
                  className="bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity"
                >
                  Bar Chart
                </Button>
                <Button
                  variant={activeChartType === 'bar3d' ? 'default' : 'outline'}
                  onClick={() => setActiveChartType('bar3d')}
                  className="bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity"
                >
                  3D Bar Chart
                </Button>
                <Button
                  variant={activeChartType === 'pie' ? 'default' : 'outline'}
                  onClick={() => setActiveChartType('pie')}
                  className="bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity"
                >
                  Pie Chart
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-8">
              {displayData.map((item, index) => (
                <Card 
                  key={index} 
                  className="p-3 border border-[#2691A4]/10 bg-gradient-to-br from-white to-[#F8FDFE] backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-xs text-gray-600 mb-1">{item.name}</div>
                  <div className="text-lg font-bold bg-gradient-to-r from-[#2691A4] to-[#36B9D3] bg-clip-text text-transparent">
                    {item.value}
                  </div>
                </Card>
              ))}
            </div>
            <DataChart 
              data={displayData} 
              title="Monthly Sales Data"
              chartType={activeChartType}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
