import { useState, useEffect, useCallback } from "react";
import { Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

interface UseChatProps {
  onMessageSent: () => void;
  onChartData: (data: any[] | null) => void;
}

export const useChat = ({ onMessageSent, onChartData }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [baseData, setBaseData] = useState<any[]>([]);
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

      if (data) {
        setBaseData(data.data);
      }
    } catch (error) {
      console.error('Error in loadMostRecentData:', error);
    }
  }, [toast]);

  useEffect(() => {
    loadMostRecentData();
  }, [loadMostRecentData]);

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
