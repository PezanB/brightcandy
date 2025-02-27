
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, LinkIcon, SendIcon, MicIcon, Volume2, VolumeX } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useState, useEffect, useRef } from "react";

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
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVoiceInputComplete, setIsVoiceInputComplete] = useState(false);
  const [isProcessingVoiceInput, setIsProcessingVoiceInput] = useState(false);
  const lastFinalTranscriptRef = useRef<string>("");
  const sendMessageRef = useRef<() => void>(() => {});

  // Store the current handleSendMessage in a ref so we can access it inside timeouts
  useEffect(() => {
    sendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Function to handle sending voice input messages
  const sendVoiceMessage = (text: string) => {
    if (!text || isLoading) return;
    
    console.log("Preparing to send voice message:", text);
    // Set input message for display
    setInputMessage(text);
    
    // Wait a tick to ensure the input value is set before sending
    setTimeout(() => {
      console.log("Actually sending voice message:", text);
      sendMessageRef.current();
      // Reset tracking variables
      lastFinalTranscriptRef.current = "";
      setIsVoiceInputComplete(false);
      setIsProcessingVoiceInput(false);
    }, 50);
  };

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    console.log("Voice transcript received:", text, "isFinal:", isFinal);
    
    // Update the input field with the current transcript
    setInputMessage(text);
    
    // Clear previous timeout if it exists
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    
    // If we have a final transcript and it's not empty
    if (isFinal && text.trim()) {
      // Prevent duplicate submissions of the same final transcript
      if (lastFinalTranscriptRef.current === text) {
        console.log("Duplicate final transcript detected, ignoring:", text);
        return;
      }
      
      // Mark this transcript as processed
      lastFinalTranscriptRef.current = text;
      setIsVoiceInputComplete(true);
      setIsProcessingVoiceInput(true);
      
      // Set a new timeout to send the message automatically after voice input stops
      const timeout = setTimeout(() => {
        if (text.trim()) {
          console.log("Auto-sending voice message now:", text);
          sendVoiceMessage(text);
        }
      }, 800); // Slightly shorter timeout for better responsiveness
      
      setInputTimeout(timeout);
    }
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (inputTimeout) {
        clearTimeout(inputTimeout);
      }
    };
  }, [inputTimeout]);

  const { isListening, toggleListening } = useVoiceInput((text, isFinal) => 
    handleVoiceTranscript(text, isFinal)
  );

  // Focus input when listening state changes
  useEffect(() => {
    if (isListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening]);

  // Auto-stop listening after message is sent
  useEffect(() => {
    if (isProcessingVoiceInput && isListening) {
      // Give a small delay to ensure the message is processed
      const stopListeningTimeout = setTimeout(() => {
        if (isListening) {
          console.log("Auto-stopping listening after message sent");
          toggleListening();
        }
      }, 300);
      
      return () => clearTimeout(stopListeningTimeout);
    }
  }, [isProcessingVoiceInput, isListening, toggleListening]);

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
          <div className="flex gap-2">
            <input
              type="file"
              id="data-upload"
              className="hidden"
              accept=".json,.xlsx,.xls,.csv"
              multiple
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('data-upload')?.click()}
              className="flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLinkData}
              className="flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={toggleListening}
              className={`flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                isListening ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white animate-pulse" : ""
              }`}
              disabled={isProcessingVoiceInput}
            >
              <MicIcon className="h-4 w-4" />
            </Button>
            {onToggleAutoSpeak && (
              <Button
                variant={autoSpeakEnabled ? "default" : "outline"}
                size="icon"
                onClick={onToggleAutoSpeak}
                className={`flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                  autoSpeakEnabled ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white" : ""
                }`}
              >
                {autoSpeakEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask a question about your data..."}
              className={`bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                isListening ? "border-[#36B9D3]" : ""
              } ${isVoiceInputComplete ? "border-green-500" : ""}`}
              disabled={isProcessingVoiceInput}
            />
            {isVoiceInputComplete && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-600 animate-pulse">
                Sending...
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={sendButtonDisabled}
            className="flex-shrink-0 bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
