
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

  return (
    <div className="h-full">
      <Card className="h-full rounded-none border border-border/40 bg-[#F9F9F9]">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto p-6">
            {hasValidData && (
              <DataChart 
                data={chartData} 
                title="Data Visualization" 
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
