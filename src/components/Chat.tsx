
import { useState } from "react";
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
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
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
            content: inputMessage
          }]
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
            handleSendMessage={handleSendMessage}
            handleUpload={handleUpload}
            handleLinkData={handleLinkData}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};
