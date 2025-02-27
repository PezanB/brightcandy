
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
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Chat with NovaEdge"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 text-lg py-6"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            size="lg"
            className="bg-[#00BFA6] hover:bg-[#00BFA6]/90 px-8"
            disabled={isLoading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
