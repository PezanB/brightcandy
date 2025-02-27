
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConversationProvider } from "@11labs/react";

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
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState<string | null>(
    localStorage.getItem("elevenlabs-api-key")
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          toast("Please login to access the dashboard");
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
    
    // Prompt for ElevenLabs API key if not found
    if (!elevenlabsApiKey) {
      const apiKey = prompt("Please enter your ElevenLabs API key for enhanced avatar animations:");
      if (apiKey) {
        localStorage.setItem("elevenlabs-api-key", apiKey);
        setElevenlabsApiKey(apiKey);
      }
    }
  }, [navigate, elevenlabsApiKey]);

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
    setAutoSpeakEnabled(prev => !prev);
    toast(
      autoSpeakEnabled 
        ? "Responses will no longer be read aloud automatically"
        : "Responses will be read aloud automatically"
    );
  }, [autoSpeakEnabled]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Only render the split view if we have messages
  const renderChatUI = () => {
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

  return (
    <ConversationProvider apiKey={elevenlabsApiKey || ""}>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-[calc(100vh-64px)]">
          {renderChatUI()}
        </div>
      </div>
    </ConversationProvider>
  );
};

export default Dashboard;
