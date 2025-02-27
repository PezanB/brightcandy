
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChartData {
  name: string;
  value: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [hasMessages, setHasMessages] = useState(false);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          toast.error("Please login to access the dashboard");
          navigate("/");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChartData = useCallback((data: ChartData[] | null) => {
    console.log("Chart data received in Dashboard:", data);
    setChartData(data);
  }, []);

  const handleMessageSent = useCallback(() => {
    setHasMessages(true);
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeakEnabled(prev => !prev);
    toast({
      title: autoSpeakEnabled ? "Auto-speak disabled" : "Auto-speak enabled",
      description: autoSpeakEnabled 
        ? "Responses will no longer be read aloud automatically" 
        : "Responses will be read aloud automatically",
    });
  }, [autoSpeakEnabled]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(100vh-64px)]">
        {hasMessages ? (
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
        ) : (
          <Chat 
            onMessageSent={handleMessageSent} 
            hasMessages={hasMessages}
            onChartData={handleChartData}
            autoSpeakEnabled={autoSpeakEnabled}
            onToggleAutoSpeak={toggleAutoSpeak}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
