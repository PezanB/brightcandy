
import { Send, Upload, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmptyStateProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleUpload: () => void;
  handleLinkData: () => void;
}

export const EmptyState = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handleUpload,
  handleLinkData,
}: EmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <img
            src="/lovable-uploads/5cc17fd4-a9e4-479d-a276-95baf79bea04.png"
            alt="Assistant"
            className="w-16 h-16 mx-auto"
          />
          <h1 className="text-2xl font-semibold">How can I help you today?</h1>
          <p className="text-muted-foreground">
            Empowering sales teams with generative AI and advanced modeling for data-driven decisions
          </p>
        </div>
        <div className="max-w-2xl mx-auto w-full space-y-4">
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
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={handleUpload}
              className="flex gap-2 items-center"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </Button>
            <Button
              variant="outline"
              onClick={handleLinkData}
              className="flex gap-2 items-center"
            >
              <Link2 className="h-4 w-4" />
              Connect Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
