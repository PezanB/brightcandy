import { useState, useEffect, useCallback } from "react";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

interface UseChatProps {
  onMessageSent: () => void;
  onChartData: (data: any[] | null) => void;
  onAssistantResponse?: (text: string) => void;
}

export const useChat = ({ onMessageSent, onChartData, onAssistantResponse }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [baseData, setBaseData] = useState<any[]>([]);
  const [isGeneralMode, setIsGeneralMode] = useState(true);
  const { toast } = useToast();
  const [requestInProgress, setRequestInProgress] = useState(false);

  // Load the most recent data on component mount, but don't load it automatically
  const loadMostRecentData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('uploaded_data')
        .select('data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // No rows returned code
          console.error('Error loading data:', error);
          toast({
            title: "Error",
            description: "Failed to load your previous data. Please try uploading again.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data && Array.isArray(data.data)) {
        setBaseData(data.data);
        setIsGeneralMode(false); // If data is loaded, switch to data mode
        toast({
          title: "Data Loaded",
          description: "Previous data has been loaded. You can switch to general mode in the chat options.",
        });
      } else {
        console.warn('Loaded data is not an array:', data);
        setBaseData([]);
      }
    } catch (error) {
      console.error('Error in loadMostRecentData:', error);
    }
  }, [toast]);

  const toggleMode = () => {
    // Only allow switching to data mode if we have data
    if (!isGeneralMode && baseData.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please upload data first before switching to data mode.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneralMode(!isGeneralMode);
    toast({
      title: isGeneralMode ? "Data Mode Activated" : "General Mode Activated",
      description: isGeneralMode 
        ? "AI will now use your uploaded data to answer questions" 
        : "AI will now answer general questions without data context",
    });
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading || requestInProgress) return;

    // If we're in data mode but have no data, warn the user
    if (!isGeneralMode && (!baseData || baseData.length === 0)) {
      toast({
        title: "No Data Available",
        description: "Please upload data first or switch to general mode.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setRequestInProgress(true);
      console.log("Sending message:", textToSend);
      console.log("Using general mode:", isGeneralMode);
      console.log("Base data length:", baseData?.length || 0);

      // Create a new user message
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: textToSend,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputMessage("");
      onMessageSent();

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{
            role: 'user',
            content: textToSend
          }],
          role: 'default',
          baseData: isGeneralMode ? [] : baseData
        }
      });

      if (error) {
        console.error("Error from Supabase function:", error);
        throw error;
      }

      console.log("Received response from Supabase function:", data);

      // Add the assistant's response to the chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response.content,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      if (onAssistantResponse) {
        onAssistantResponse(data.response.content);
      }

      if (data.chartData && Array.isArray(data.chartData) && data.chartData.length > 0) {
        console.log("Chart data received:", data.chartData);
        onChartData(data.chartData);
      } else {
        console.log("No chart data in response");
        onChartData(null);
      }

    } catch (error) {
      console.error('Error calling AI:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRequestInProgress(false);
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    baseData,
    setBaseData,
    handleSendMessage,
    isGeneralMode,
    toggleMode,
    loadMostRecentData
  };
};
