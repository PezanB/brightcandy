
import { useState, useEffect, useCallback } from "react";
import { Message } from "@/types/chat";
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
      // Since we're not using Supabase anymore, we'll check localStorage
      const storedData = localStorage.getItem('lastUploadedData');
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setBaseData(parsedData);
            setIsGeneralMode(false); // If data is loaded, switch to data mode
            toast({
              title: "Data Loaded",
              description: "Previous data has been loaded. You can switch to general mode in the chat options.",
            });
            return;
          }
        } catch (parseError) {
          console.error('Error parsing stored data:', parseError);
        }
      }
      
      // If we get here, no valid data was found
      console.log('No previous data found in localStorage');
      setBaseData([]);
      
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

  // Mock API response generator - simulates what the Supabase edge function would return
  const generateMockResponse = async (userMessage: string) => {
    // Create a delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a simple response based on the user message
    const responses = [
      "I understand you're asking about " + userMessage.substring(0, 20) + "... Let me analyze that for you.",
      "Based on the data and your question about " + userMessage.substring(0, 15) + "..., I can provide some insights.",
      "That's an interesting question about " + userMessage.substring(0, 10) + "... Here's what I found.",
      "I've analyzed your question and the available data. Here's what I can tell you about " + userMessage.substring(0, 25) + "..."
    ];
    
    // Use data mode to determine response type
    const response = isGeneralMode 
      ? "In general mode, I can tell you that " + responses[Math.floor(Math.random() * responses.length)]
      : "Based on your uploaded data, " + responses[Math.floor(Math.random() * responses.length)];
    
    // Potentially generate chart data in data mode
    let chartData = null;
    if (!isGeneralMode && baseData.length > 0 && Math.random() > 0.5) {
      chartData = baseData.slice(0, 5).map(item => ({
        name: item.name || item.category || item.type || "Item",
        value: item.value || item.amount || item.count || Math.floor(Math.random() * 100)
      }));
    }
    
    return {
      response: {
        content: response
      },
      chartData
    };
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

      // Instead of calling Supabase function, use our mock generator
      const data = await generateMockResponse(textToSend);

      console.log("Received response:", data);

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
