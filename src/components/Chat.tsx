
import { useUserRole } from "@/hooks/useUserRole";
import { useChat } from "@/hooks/useChat";
import { useFileUpload } from "@/hooks/useFileUpload";
import { EmptyState } from "./chat/EmptyState";
import { MessageInput } from "./chat/MessageInput";
import { MessageItem } from "./chat/MessageItem";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "@/components/ui/database";
import { VolumeX, Volume2 } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
}

interface ChatProps {
  onMessageSent: () => void;
  hasMessages: boolean;
  onChartData: (data: ChartData[] | null) => void;
  autoSpeakEnabled: boolean;
  onToggleAutoSpeak: () => void;
}

export const Chat = ({ 
  onMessageSent, 
  hasMessages, 
  onChartData, 
  autoSpeakEnabled, 
  onToggleAutoSpeak 
}: ChatProps) => {
  const userRole = useUserRole();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak, isSpeaking, stopSpeaking } = useTextToSpeech();
  
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    baseData,
    setBaseData,
    handleSendMessage,
    isGeneralMode,
    toggleMode
  } = useChat({
    onMessageSent,
    onChartData,
    onAssistantResponse: (text: string) => {
      // Only attempt to speak if auto-speak is enabled and the text is not empty
      if (autoSpeakEnabled && text && text.trim().length > 0) {
        speak(text);
      }
    }
  });

  const { handleUpload } = useFileUpload(setBaseData);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    console.log("Chat component - Messages updated:", messages);
  }, [messages]); // Scroll when messages change

  const handleLinkData = () => {
    toast({
      title: "Link data",
      description: "Data linking functionality will be implemented here",
    });
  };

  return (
    <div className={`flex h-full flex-col bg-[#F9F9F9] shadow-md ${messages.length === 0 ? 'w-full' : ''}`}>
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
          <div className="flex-1 px-6 pb-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto pt-4 pb-8">
              {baseData.length > 0 && (
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      {isGeneralMode ? "General Mode" : "Data Mode"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onToggleAutoSpeak}
                      className="text-xs flex items-center gap-1"
                    >
                      {autoSpeakEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      {autoSpeakEnabled ? "Mute" : "Unmute"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleMode}
                      className="text-xs"
                    >
                      Switch to {isGeneralMode ? "Data" : "General"} Mode
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageItem 
                    key={message.id} 
                    message={message} 
                    isSpeaking={message.sender === 'assistant' && isSpeaking}
                    onStopSpeaking={stopSpeaking}
                  />
                ))}
                <div ref={messagesEndRef} />
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
            autoSpeakEnabled={autoSpeakEnabled}
            onToggleAutoSpeak={onToggleAutoSpeak}
          />
        </>
      )}
    </div>
  );
};
