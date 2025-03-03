
import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";
import { TalkingAvatar } from "./TalkingAvatar";
import { MessageInput } from "./MessageInput";
import { Button } from "@/components/ui/button";
import { Database } from "@/components/ui/database";
import { VolumeX, Volume2 } from "lucide-react";

interface ChatContainerProps {
  messages: {
    id: string;
    text: string;
    sender: "user" | "assistant";
    timestamp: Date;
  }[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (message?: string) => void;
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLinkData: () => void;
  isLoading: boolean;
  baseData: any[];
  isGeneralMode: boolean;
  toggleMode: () => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  autoSpeakEnabled: boolean;
  onToggleAutoSpeak: () => void;
  lastSpokenMessageRef: React.MutableRefObject<string | null>;
  onSpeakMessage: (text: string) => void;
}

export const ChatContainer = ({
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleUpload,
  handleLinkData,
  isLoading,
  baseData,
  isGeneralMode,
  toggleMode,
  isSpeaking,
  stopSpeaking,
  autoSpeakEnabled,
  onToggleAutoSpeak,
  lastSpokenMessageRef,
  onSpeakMessage
}: ChatContainerProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto pt-4 pb-8">
          {baseData.length > 0 && (
            <ChatModeSelector 
              isGeneralMode={isGeneralMode} 
              toggleMode={toggleMode} 
              autoSpeakEnabled={autoSpeakEnabled} 
              onToggleAutoSpeak={onToggleAutoSpeak} 
            />
          )}
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageItem 
                key={message.id} 
                message={message} 
                isSpeaking={message.sender === 'assistant' && isSpeaking && lastSpokenMessageRef.current === message.text}
                onSpeakMessage={() => onSpeakMessage(message.text)}
                onStopSpeaking={stopSpeaking}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      <TalkingAvatar isSpeaking={isSpeaking} />
      <MessageInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        handleUpload={handleUpload}
        handleLinkData={handleLinkData}
        isLoading={isLoading}
        autoSpeakEnabled={autoSpeakEnabled}
        onToggleAutoSpeak={onToggleAutoSpeak}
      />
    </>
  );
};

interface ChatModeSelectorProps {
  isGeneralMode: boolean;
  toggleMode: () => void;
  autoSpeakEnabled: boolean;
  onToggleAutoSpeak: () => void;
}

const ChatModeSelector = ({ 
  isGeneralMode, 
  toggleMode, 
  autoSpeakEnabled, 
  onToggleAutoSpeak 
}: ChatModeSelectorProps) => {
  return (
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
  );
};
