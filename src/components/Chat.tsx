
import { useUserRole } from "@/hooks/useUserRole";
import { useChat } from "@/hooks/useChat";
import { useFileUpload } from "@/hooks/useFileUpload";
import { EmptyState } from "./chat/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useRef, useCallback, useState, useEffect } from "react";
import { ChatContainer } from "./chat/ChatContainer";

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

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        stopSpeaking();
      }
    };
  }, [isSpeaking, stopSpeaking]);

  const handleLinkData = useCallback(() => {
    // When the user explicitly wants to link data, we'll load it
    loadMostRecentData();
    toast({
      title: "Data Loaded",
      description: "Your previously uploaded data has been loaded.",
    });
  }, [loadMostRecentData, toast]);
  
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
        <ChatContainer
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessageAndUpdateState}
          handleUpload={handleUpload}
          handleLinkData={handleLinkData}
          isLoading={isLoading}
          baseData={baseData}
          isGeneralMode={isGeneralMode}
          toggleMode={toggleMode}
          isSpeaking={isSpeaking}
          stopSpeaking={stopSpeaking}
          autoSpeakEnabled={autoSpeakEnabled}
          onToggleAutoSpeak={onToggleAutoSpeak}
          lastSpokenMessageRef={lastSpokenMessageRef}
          onSpeakMessage={handleSpeakMessage}
        />
      )}
    </div>
  );
};
