
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
  const [isGeneralMode, setIsGeneralMode] = useState(true); // Default to general mode
  const { toast } = useToast();

  // Load the most recent data on component mount
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

  useEffect(() => {
    loadMostRecentData();
  }, [loadMostRecentData]);

  const toggleMode = () => {
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
    if (!textToSend || isLoading) return;

    try {
      setIsLoading(true);
      console.log("Sending message:", textToSend);
      console.log("Using general mode:", isGeneralMode);
      if (!isGeneralMode) {
        console.log("Using base data:", baseData);
      }

      // Add the user message to the chat immediately
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: textToSend,
        sender: "user",
        timestamp: new Date(),
      };

      console.log("Adding user message to chat:", newUserMessage);
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputMessage(""); // Clear the input field after sending
      onMessageSent(); // Notify parent component that a message was sent

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{
            role: 'user',
            content: textToSend
          }],
          role: 'default',
          baseData: isGeneralMode ? [] : baseData // Only send data if not in general mode
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

      console.log("Adding assistant message to chat:", assistantMessage);
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      // Call the onAssistantResponse callback with the response text
      if (onAssistantResponse) {
        onAssistantResponse(data.response.content);
      }

      if (data.chartData && data.chartData.length > 0) {
        onChartData(data.chartData);
      } else {
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
    toggleMode
  };
};
