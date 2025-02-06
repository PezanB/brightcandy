
import { Card } from "@/components/ui/card";

export const ResultsPanel = () => {
  return (
    <div className="h-full bg-[#222222] p-6">
      <Card className="h-full rounded-xl border border-border/40 bg-[#F9F9F9] p-6">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-semibold">Sales Leads Data</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">189 MB</span>
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <div className="space-y-4">
              <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                <div className="absolute h-full w-full bg-[#0086C9] transition-all duration-500" style={{ width: "100%" }}></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
