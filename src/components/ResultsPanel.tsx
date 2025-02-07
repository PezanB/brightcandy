
import { Card } from "@/components/ui/card";
import { DataChart } from "@/components/charts/DataChart";

interface ChartData {
  name: string;
  value: number;
}

export const ResultsPanel = () => {
  // For testing purposes, we'll use sample data
  // This should be replaced with actual data from OpenAI response
  const sampleData: ChartData[] = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Apr", value: 800 },
    { name: "May", value: 500 }
  ];

  return (
    <div className="h-full">
      <Card className="h-full rounded-none border border-border/40 bg-[#F9F9F9]">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto p-6">
            <DataChart 
              data={sampleData} 
              title="Sample Data Visualization" 
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
