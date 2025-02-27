
import { useState, useEffect } from "react";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChartData {
  name: string;
  value: number;
}

interface UseChatProps {
  onMessageSent: () => void;
  onChartData: (data: ChartData[] | null) => void;
}

export const useChat = ({ onMessageSent, onChartData }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [baseData, setBaseData] = useState<any[]>(() => {
    const savedData = localStorage.getItem('chatBaseData');
    return savedData ? JSON.parse(savedData) : [];
  });
  const { toast } = useToast();

  // Persist baseData to localStorage whenever it changes
  useEffect(() => {
    if (baseData.length > 0) {
      localStorage.setItem('chatBaseData', JSON.stringify(baseData));
    }
  }, [baseData]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    try {
      setIsLoading(true);
      console.log("Sending message:", textToSend);
      console.log("Using base data:", baseData);

      const newMessage: Message = {
        id: Date.now().toString(),
        text: textToSend,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputMessage("");
      onMessageSent();

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{
            role: 'user',
            content: textToSend
          }],
          role: 'default',
          baseData: baseData
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response.content,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

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
    handleSendMessage
  };
};
