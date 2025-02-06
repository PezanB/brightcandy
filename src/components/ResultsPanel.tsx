
import { Card } from "@/components/ui/card";

export const ResultsPanel = () => {
  return (
    <div className="h-full p-6">
      <Card className="h-full rounded-xl border border-border/40 bg-[#F9F9F9] p-6">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-semibold">Results</h2>
          </div>
          <div className="flex-1 overflow-auto py-4">
          </div>
        </div>
      </Card>
    </div>
  );
};
