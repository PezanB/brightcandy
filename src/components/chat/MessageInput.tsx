
import { Send, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleUpload: () => void;
  handleLinkData: () => void;
}

export const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleUpload,
  handleLinkData,
}: MessageInputProps) => {
  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 items-center">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Chat with NovaEdge"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-[#0086C9] hover:bg-[#0086C9]/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpload}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Data Setup
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLinkData}
            className="flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            Data Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};
