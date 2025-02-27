
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Declare global Window interface extension
declare global {
  interface Window {
    ELEVENLABS_API_KEY?: string;
  }
}

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
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch the ElevenLabs API key from Supabase
  const fetchApiKey = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('user_id', uid)
        .eq('key_name', 'elevenlabs')
        .single();
      
      if (error) {
        console.error('Error fetching API key:', error);
        return null;
      }
      
      return data?.key_value || null;
    } catch (error) {
      console.error('Error in fetchApiKey:', error);
      return null;
    }
  };

  // Save the ElevenLabs API key to Supabase
  const saveApiKey = async (uid: string, apiKey: string) => {
    try {
      // First check if an API key already exists
      const { data, error: fetchError } = await supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', uid)
        .eq('key_name', 'elevenlabs')
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the "no rows found" error
        console.error('Error checking existing API key:', fetchError);
        return false;
      }
      
      if (data) {
        // Update existing key
        const { error: updateError } = await supabase
          .from('api_keys')
          .update({ key_value: apiKey, updated_at: new Date().toISOString() })
          .eq('id', data.id);
        
        if (updateError) {
          console.error('Error updating API key:', updateError);
          return false;
        }
      } else {
        // Insert new key
        const { error: insertError } = await supabase
          .from('api_keys')
          .insert([
            { 
              user_id: uid, 
              key_name: 'elevenlabs', 
              key_value: apiKey 
            }
          ]);
        
        if (insertError) {
          console.error('Error inserting API key:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveApiKey:', error);
      return false;
    }
  };

  // Prompt the user for their ElevenLabs API key
  const promptForApiKey = async (uid: string) => {
    const apiKey = prompt("Please enter your ElevenLabs API key for enhanced avatar animations:");
    if (apiKey) {
      const success = await saveApiKey(uid, apiKey);
      if (success) {
        setElevenlabsApiKey(apiKey);
        window.ELEVENLABS_API_KEY = apiKey;
        toast.success("ElevenLabs API key saved!");
        return apiKey;
      } else {
        toast.error("Failed to save ElevenLabs API key");
      }
    } else {
      toast.warning("No ElevenLabs API key provided. Avatar animations will be limited.");
    }
    return null;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          toast("Please login to access the dashboard");
          navigate("/");
          return;
        }

        setUserId(user.id);
        
        // Fetch the ElevenLabs API key
        const apiKey = await fetchApiKey(user.id);
        
        if (apiKey) {
          setElevenlabsApiKey(apiKey);
          window.ELEVENLABS_API_KEY = apiKey;
        } else {
          // If no API key is found, prompt the user
          await promptForApiKey(user.id);
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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(100vh-64px)]">
        {renderChatUI()}
      </div>
    </div>
  );
};

export default Dashboard;
