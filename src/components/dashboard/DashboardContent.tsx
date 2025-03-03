
import { useState, useCallback } from "react";
import { Chat } from "@/components/Chat";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { toast } from "sonner";

interface ChartData {
  name: string;
  value: number;
}

interface DashboardContentProps {
  autoSpeakEnabled: boolean;
  onToggleAutoSpeak: () => void;
}

export const DashboardContent = ({ autoSpeakEnabled, onToggleAutoSpeak }: DashboardContentProps) => {
  const [hasMessages, setHasMessages] = useState(false);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);

  const handleChartData = useCallback((data: ChartData[] | null) => {
    console.log("Chart data received in Dashboard:", data);
    setChartData(data);
  }, []);

  const handleMessageSent = useCallback(() => {
    console.log("Message sent callback triggered in Dashboard");
    // This callback is called when a message is sent from either the EmptyState or Chat component
    setHasMessages(true);
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    onToggleAutoSpeak();
    toast(
      autoSpeakEnabled 
        ? "Responses will no longer be read aloud automatically"
        : "Responses will be read aloud automatically"
    );
  }, [autoSpeakEnabled, onToggleAutoSpeak]);

  // Only render the split view if we have messages
  if (hasMessages) {
    return (
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={35} minSize={30}>
          <Chat 
            onMessageSent={handleMessageSent} 
            hasMessages={hasMessages}
            onChartData={handleChartData}
            autoSpeakEnabled={autoSpeakEnabled}
            onToggleAutoSpeak={toggleAutoSpeak}
          />
        </ResizablePanel>
        <ResizableHandle className="bg-border hover:bg-[#2691A4]/20 transition-colors duration-200" />
        <ResizablePanel defaultSize={65} minSize={30}>
          <ResultsPanel chartData={chartData} />
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }
  
  return (
    <Chat 
      onMessageSent={handleMessageSent} 
      hasMessages={hasMessages}
      onChartData={handleChartData}
      autoSpeakEnabled={autoSpeakEnabled}
      onToggleAutoSpeak={toggleAutoSpeak}
    />
  );
};
