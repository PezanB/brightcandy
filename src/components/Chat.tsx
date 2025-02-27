
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { EmptyState } from "./chat/EmptyState";
import { MessageInput } from "./chat/MessageInput";
import { MessageItem } from "./chat/MessageItem";

interface ChartData {
  name: string;
  value: number;
}

interface ChatProps {
  onMessageSent: () => void;
  hasMessages: boolean;
  onChartData: (data: ChartData[] | null) => void;
}

export const Chat = ({ onMessageSent, hasMessages, onChartData }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [baseData, setBaseData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      const username = sessionStorage.getItem('username');
      if (!username) {
        console.log('No username found in session storage');
        return;
      }

      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', username)
          .maybeSingle();

        if (roleError) throw roleError;
        if (roleData) {
          setUserRole(roleData.role);
          console.log('User role set to:', roleData.role);
        } else {
          console.log('No role found for user:', username);
          setUserRole('default');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user role. Using default AI assistant.",
          variant: "destructive",
        });
        setUserRole('default');
      }
    };

    fetchUserRole();
  }, [toast]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    try {
      setIsLoading(true);
      console.log("Sending message:", textToSend);

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
          role: userRole || 'default',
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

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      setBaseData(jsonData);
      toast({
        title: "Success",
        description: "Data loaded successfully. You can now ask questions about your data!",
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please ensure it's a valid JSON file.",
        variant: "destructive",
      });
    }
  };

  const handleLinkData = () => {
    toast({
      title: "Link data",
      description: "Data linking functionality will be implemented here",
    });
  };

  return (
    <div className={`flex h-full flex-col bg-[#F9F9F9] ${messages.length === 0 ? 'w-full' : ''}`}>
      {messages.length === 0 && !hasMessages ? (
        <EmptyState
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          handleUpload={handleUpload}
          handleLinkData={handleLinkData}
        />
      ) : (
        <>
          <div className="flex-1 p-6 pb-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto pt-4 pb-8">
              <div className="space-y-8">
                {messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
              </div>
            </div>
          </div>
          <MessageInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={() => handleSendMessage()}
            handleUpload={handleUpload}
            handleLinkData={handleLinkData}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};
