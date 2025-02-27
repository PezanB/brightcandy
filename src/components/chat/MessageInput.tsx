
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, LinkIcon, SendIcon, MicIcon } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useState, useEffect, useRef } from "react";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLinkData: () => void;
  isLoading: boolean;
}

export const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleUpload,
  handleLinkData,
  isLoading,
}: MessageInputProps) => {
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isVoiceInputComplete, setIsVoiceInputComplete] = useState(false);

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    console.log("Voice transcript received:", text, "isFinal:", isFinal);
    
    // Set input message directly
    setInputMessage(text);
    
    // Clear previous timeout if it exists
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    
    if (isFinal) {
      setIsVoiceInputComplete(true);
      // Set a new timeout to send the message automatically after voice input stops
      const timeout = setTimeout(() => {
        if (text.trim()) {
          console.log("Auto-sending voice message:", text);
          handleSendMessage();
        }
        setIsVoiceInputComplete(false);
      }, 1500); // 1.5s delay after voice input
      
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

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

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
            >
              <MicIcon className="h-4 w-4" />
            </Button>
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
            />
            {isVoiceInputComplete && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-600 animate-pulse">
                Sending in 1.5s...
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="flex-shrink-0 bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
