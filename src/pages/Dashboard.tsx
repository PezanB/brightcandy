
import { useEffect, useState } from "react";
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

  const handleChartData = (data: ChartData[] | null) => {
    setChartData(data);
  };

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
                onMessageSent={() => setHasMessages(true)} 
                hasMessages={hasMessages}
                onChartData={handleChartData}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={65} minSize={30}>
              <ResultsPanel chartData={chartData} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <Chat 
            onMessageSent={() => setHasMessages(true)} 
            hasMessages={hasMessages}
            onChartData={handleChartData}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
