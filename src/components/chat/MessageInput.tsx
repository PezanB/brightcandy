
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperclipIcon, LinkIcon, SendIcon, MicIcon } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useState, useEffect } from "react";

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

  const handleVoiceTranscript = (text: string) => {
    console.log("Voice transcript received:", text);
    setInputMessage(text);
    
    // Clear previous timeout if it exists
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    
    // Set a new timeout to send the message automatically after voice input stops
    const timeout = setTimeout(() => {
      if (text.trim()) {
        handleSendMessage();
      }
    }, 1500); // 1.5s delay after voice input
    
    setInputTimeout(timeout);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (inputTimeout) {
        clearTimeout(inputTimeout);
      }
    };
  }, [inputTimeout]);

  const { isListening, toggleListening } = useVoiceInput(handleVoiceTranscript);

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
                isListening ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white" : ""
              }`}
            >
              <MicIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask a question about your data..."}
              className={`bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                isListening ? "animate-pulse" : ""
              }`}
            />
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
