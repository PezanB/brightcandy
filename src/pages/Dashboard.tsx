
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";

interface ChartData {
  name: string;
  value: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [hasMessages, setHasMessages] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>();

  useEffect(() => {
    const checkAccess = async () => {
      const username = sessionStorage.getItem('username');
      if (!username) {
        navigate("/");
        return;
      }

      // Check user role in user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', username)
        .maybeSingle();

      const hasAccess = roleData?.role === 'admin' || roleData?.role === 'manager';
      if (!hasAccess) {
        navigate("/");
      }
    };

    checkAccess();
  }, [navigate]);

  const handleChartData = (data: ChartData[]) => {
    setChartData(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(100vh-64px)]">
        {hasMessages ? (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={30}>
              <Chat 
                onMessageSent={() => setHasMessages(true)} 
                hasMessages={hasMessages}
                onChartData={handleChartData}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={70} minSize={30}>
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
