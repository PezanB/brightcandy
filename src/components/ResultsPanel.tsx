
import { Card } from "@/components/ui/card";
import { DataChart } from "@/components/charts/DataChart";

interface ChartData {
  name: string;
  value: number;
}

interface ResultsPanelProps {
  chartData?: ChartData[] | null;
}

export const ResultsPanel = ({ chartData }: ResultsPanelProps) => {
  const hasValidData = chartData && Array.isArray(chartData) && chartData.length > 0;
  console.log('ResultsPanel received chartData:', chartData);

  if (!hasValidData) {
    console.log('No valid chart data available');
    return (
      <div className="h-full">
        <Card className="h-full rounded-none border-none bg-gradient-to-br from-[#F9F9F9] to-[#EDF7F9]">
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No data to display</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Card className="h-full rounded-none border-none bg-gradient-to-br from-[#F9F9F9] to-[#EDF7F9]">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto p-8">
            <h2 className="text-2xl font-semibold mb-6 text-[#2691A4]">Results</h2>
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {chartData.map((item, index) => (
                  <Card 
                    key={index} 
                    className="p-6 border border-[#2691A4]/10 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="font-medium text-gray-600 mb-2">{item.name}</div>
                    <div className="text-3xl font-bold text-[#2691A4]">{item.value}</div>
                  </Card>
                ))}
              </div>
            </div>
            <DataChart 
              data={chartData} 
              title="Data Visualization" 
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

