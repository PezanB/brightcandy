
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { EmptyState } from "./chat/EmptyState";
import { MessageInput } from "./chat/MessageInput";
import { MessageItem } from "./chat/MessageItem";

interface ChatProps {
  onMessageSent: () => void;
  hasMessages: boolean;
}

export const Chat = ({ onMessageSent, hasMessages }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
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

    const newMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);
    onMessageSent();

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{
            role: 'user',
            content: textToSend
          }],
          role: userRole || 'default'
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response.content,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
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

  const handleUpload = () => {
    toast({
      title: "Upload feature",
      description: "File upload functionality will be implemented here",
    });
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
          <div className="flex-1 p-4 pb-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto pt-4 pb-8">
              <div className="space-y-6">
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
