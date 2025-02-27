
import { BarChart2, Search, TrendingUp, Settings, Lightbulb, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceController } from "@/hooks/voice/useVoiceController";
import { useState, useEffect } from "react";
import { VoiceInputButton } from "./message-input/VoiceInputButton";
import { AutoSpeakButton } from "./message-input/AutoSpeakButton";
import { MessageTextField } from "./message-input/MessageTextField";
import { SendButton } from "./message-input/SendButton";

interface EmptyStateProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (message?: string) => void;
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLinkData: () => void;
  autoSpeakEnabled?: boolean;
  onToggleAutoSpeak?: () => void;
}

export const EmptyState = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleUpload,
  handleLinkData,
  autoSpeakEnabled,
  onToggleAutoSpeak,
}: EmptyStateProps) => {
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (inputTimeout) {
        clearTimeout(inputTimeout);
      }
    };
  }, [inputTimeout]);

  const {
    isListening,
    toggleListening,
    isVoiceInputComplete,
    isProcessingVoiceInput,
    inputRef
  } = useVoiceController({
    setInputMessage,
    handleSendMessage,
    isLoading: false
  });

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "Sales Data Insights", icon: <BarChart2 className="h-4 w-4" /> },
    { text: "Sales Data Diagnostics", icon: <Search className="h-4 w-4" /> },
    { text: "Sales Performance Projections", icon: <TrendingUp className="h-4 w-4" /> },
    { text: "Sales Optimization Solutions", icon: <Settings className="h-4 w-4" /> },
    { text: "Creative Strategies", icon: <Lightbulb className="h-4 w-4" /> },
    { text: "Sustainable Eco-system", icon: <Leaf className="h-4 w-4" /> },
  ];

  const handleQuickActionClick = (text: string) => {
    handleSendMessage(text);
  };

  // Disable the send button while processing voice input to prevent double submissions
  const sendButtonDisabled = !inputMessage.trim() || isProcessingVoiceInput;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-800">
            How can I help you today?
          </h1>
          <p className="text-lg text-gray-600">
            Empowering sales teams with generative AI and advanced modeling for data-driven decisions
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <MessageTextField 
              ref={inputRef}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              isListening={isListening}
              isVoiceInputComplete={isVoiceInputComplete}
              isProcessingVoiceInput={isProcessingVoiceInput}
              onKeyPress={handleKeyPress}
              className="h-[52px] text-base rounded-xl shadow-md hover:shadow-lg transition-shadow"
              placeholder="Chat with BrightCandy"
            />
          </div>
          <VoiceInputButton 
            isListening={isListening}
            toggleListening={toggleListening}
            isProcessingVoiceInput={isProcessingVoiceInput}
            className="h-[52px] rounded-xl shadow-md hover:shadow-lg transition-shadow"
          />
          {onToggleAutoSpeak && (
            <AutoSpeakButton 
              autoSpeakEnabled={autoSpeakEnabled}
              onToggleAutoSpeak={onToggleAutoSpeak}
              className="h-[52px] rounded-xl shadow-md hover:shadow-lg transition-shadow"
            />
          )}
          <SendButton 
            handleSendMessage={() => handleSendMessage()}
            disabled={sendButtonDisabled}
            className="px-8 h-[52px] rounded-xl shadow-md hover:shadow-lg transition-shadow"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto py-3 px-4 border-[1px] border-transparent bg-white text-gray-700 rounded-xl whitespace-normal text-left hover:text-[#2691A4] relative before:absolute before:inset-0 before:rounded-xl before:border before:border-transparent before:bg-gradient-to-r before:from-[#2691A4] before:to-[#36B9D3] before:content-[''] before:-z-10 before:p-[1px] before:mask before:mask-composite shadow-md hover:shadow-lg transition-shadow"
              onClick={() => handleQuickActionClick(action.text)}
            >
              {action.icon}
              <span className="ml-2 line-clamp-2">{action.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
