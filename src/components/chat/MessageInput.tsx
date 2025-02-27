
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleUpload: () => void;
  handleLinkData: () => void;
  isLoading?: boolean;
}

export const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading = false,
}: MessageInputProps) => {
  return (
    <div className="border-t bg-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Chat with BrightCandy"
              className="w-full pr-12 h-[52px] text-base"
              disabled={isLoading}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            size="lg"
            className="bg-[#2691A4] hover:bg-[#2691A4]/90 px-8 h-[52px] rounded-lg"
            disabled={isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
