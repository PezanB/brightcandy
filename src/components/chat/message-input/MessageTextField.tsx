
import { Input } from "@/components/ui/input";
import { FC, ForwardedRef, forwardRef } from "react";

interface MessageTextFieldProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  isListening: boolean;
  isVoiceInputComplete: boolean;
  isProcessingVoiceInput: boolean;
  onKeyPress: (event: React.KeyboardEvent) => void;
  className?: string;
  placeholder?: string;
}

export const MessageTextField = forwardRef<HTMLInputElement, MessageTextFieldProps>(({
  inputMessage,
  setInputMessage,
  isListening,
  isVoiceInputComplete,
  isProcessingVoiceInput,
  onKeyPress,
  className,
  placeholder
}, ref) => {
  return (
    <div className="flex-1 relative">
      <Input
        ref={ref}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={isListening ? "Listening..." : placeholder || "Ask a question about your data..."}
        className={`bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
          isListening ? "border-[#36B9D3]" : ""
        } ${isVoiceInputComplete ? "border-green-500" : ""} ${className || ""}`}
        disabled={isProcessingVoiceInput}
      />
      {isVoiceInputComplete && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-600 animate-pulse">
          Sending...
        </div>
      )}
    </div>
  );
});

MessageTextField.displayName = "MessageTextField";
