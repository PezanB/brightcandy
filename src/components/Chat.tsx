
import { useUserRole } from "@/hooks/useUserRole";
import { useChat } from "@/hooks/useChat";
import { useFileUpload } from "@/hooks/useFileUpload";
import { EmptyState } from "./chat/EmptyState";
import { MessageInput } from "./chat/MessageInput";
import { MessageItem } from "./chat/MessageItem";
import { useToast } from "@/hooks/use-toast";

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
  const userRole = useUserRole();
  const { toast } = useToast();
  
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    baseData,
    setBaseData,
    handleSendMessage
  } = useChat({ onMessageSent, onChartData });

  const { handleUpload } = useFileUpload(setBaseData);

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
