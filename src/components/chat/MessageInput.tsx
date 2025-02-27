
import { useRef } from "react";
import { ActionButtons } from "./message-input/ActionButtons";
import { MessageTextField } from "./message-input/MessageTextField";
import { SendButton } from "./message-input/SendButton";
import { useVoiceController } from "@/hooks/voice/useVoiceController";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLinkData: () => void;
  isLoading: boolean;
  autoSpeakEnabled?: boolean;
  onToggleAutoSpeak?: () => void;
}

export const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleUpload,
  handleLinkData,
  isLoading,
  autoSpeakEnabled,
  onToggleAutoSpeak,
}: MessageInputProps) => {
  const {
    isListening,
    toggleListening,
    isVoiceInputComplete,
    isProcessingVoiceInput,
    inputRef
  } = useVoiceController({
    setInputMessage,
    handleSendMessage,
    isLoading
  });

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Disable the send button while processing voice input to prevent double submissions
  const sendButtonDisabled = !inputMessage.trim() || isLoading || isProcessingVoiceInput;

  return (
    <div className="border-t border-gray-200 bg-white p-4 shadow-md">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4">
          <ActionButtons 
            handleUpload={handleUpload}
            handleLinkData={handleLinkData}
            isListening={isListening}
            toggleListening={toggleListening}
            isProcessingVoiceInput={isProcessingVoiceInput}
            autoSpeakEnabled={autoSpeakEnabled}
            onToggleAutoSpeak={onToggleAutoSpeak}
          />
          <MessageTextField 
            ref={inputRef}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            isListening={isListening}
            isVoiceInputComplete={isVoiceInputComplete}
            isProcessingVoiceInput={isProcessingVoiceInput}
            onKeyPress={handleKeyPress}
          />
          <SendButton 
            handleSendMessage={handleSendMessage}
            disabled={sendButtonDisabled}
          />
        </div>
      </div>
    </div>
  );
};
