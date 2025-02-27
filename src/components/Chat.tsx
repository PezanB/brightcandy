
import { useUserRole } from "@/hooks/useUserRole";
import { useChat } from "@/hooks/useChat";
import { useFileUpload } from "@/hooks/useFileUpload";
import { EmptyState } from "./chat/EmptyState";
import { MessageInput } from "./chat/MessageInput";
import { MessageItem } from "./chat/MessageItem";
import { TalkingAvatar } from "./chat/TalkingAvatar";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useEffect, useRef, useCallback, useState } from "react";
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
  const lastSpokenMessageRef = useRef<string | null>(null);
  const [localHasMessages, setLocalHasMessages] = useState(hasMessages);
  
  // Initialize text-to-speech with improved voice quality options
  const { speak, isSpeaking, stopSpeaking } = useTextToSpeech({
    voice: 'nova', // Use nova voice for more natural sound
    rate: 1.05,    // Slightly faster rate for better responsiveness
    pitch: 1.0
  });
  
  const {
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
  } = useChat({
    onMessageSent: () => {
      // Call parent's onMessageSent callback to update Dashboard state
      onMessageSent();
      // Also update local state to trigger UI changes
      setLocalHasMessages(true);
    },
    onChartData,
    onAssistantResponse: (text: string) => {
      // Only speak if auto-speak is enabled, text is not empty, and it's a new message
      if (autoSpeakEnabled && text && text.trim().length > 0 && lastSpokenMessageRef.current !== text) {
        console.log("Speaking assistant response:", text.substring(0, 50) + "...");
        lastSpokenMessageRef.current = text;
        speak(text);
      }
    }
  });

  // Synchronize parent prop with local state when it changes
  useEffect(() => {
    setLocalHasMessages(hasMessages || messages.length > 0);
  }, [hasMessages, messages.length]);

  const { handleUpload } = useFileUpload(setBaseData);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    console.log("Chat component - Messages updated:", messages);
  }, [messages]); // Scroll when messages change
  
  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        stopSpeaking();
      }
    };
  }, [isSpeaking, stopSpeaking]);

  const handleLinkData = () => {
    // When the user explicitly wants to link data, we'll load it
    loadMostRecentData();
    toast({
      title: "Data Loaded",
      description: "Your previously uploaded data has been loaded.",
    });
  };
  
  // Handler for speaking a specific message
  const handleSpeakMessage = useCallback((text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  }, [speak, stopSpeaking, isSpeaking]);

  // Custom handler to ensure message sending properly updates states
  const handleSendMessageAndUpdateState = useCallback((message?: string) => {
    console.log("Sending message from Chat component:", message || inputMessage);
    handleSendMessage(message);
  }, [handleSendMessage, inputMessage]);

  // Use the combined state (local or parent) to determine UI state
  const shouldShowEmptyState = !localHasMessages && messages.length === 0;

  return (
    <div className={`flex h-full flex-col bg-[#F9F9F9] shadow-md ${messages.length === 0 ? 'w-full' : ''}`}>
      {messages.length > 0 || localHasMessages ? (
        // Only show TalkingAvatar when we have messages or are in chat mode
        <TalkingAvatar isSpeaking={isSpeaking} />
      ) : null}
      
      {shouldShowEmptyState ? (
        <EmptyState
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessageAndUpdateState}
          handleUpload={handleUpload}
          handleLinkData={handleLinkData}
          autoSpeakEnabled={autoSpeakEnabled}
          onToggleAutoSpeak={onToggleAutoSpeak}
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
                    isSpeaking={message.sender === 'assistant' && isSpeaking && lastSpokenMessageRef.current === message.text}
                    onSpeakMessage={() => handleSpeakMessage(message.text)}
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
            handleSendMessage={handleSendMessageAndUpdateState}
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
