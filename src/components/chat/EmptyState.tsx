
import { Bot, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmptyStateProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (message?: string) => void;
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
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
      <div className="max-w-2xl mx-auto space-y-8 w-full">
        <div className="space-y-4">
          <img 
            src="/lovable-uploads/124b6a31-cae2-44ea-aa45-f19b2d9822f2.png" 
            alt="Logo" 
            className="mx-auto w-32 h-32 mb-6"
          />
          <h1 className="text-3xl font-bold tracking-tight text-content">
            Welcome to NovaEdge AI Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Get started by asking a question or exploring our features below.
          </p>
        </div>

        <div className="grid gap-6 w-full max-w-xl mx-auto">
          <div className="flex gap-4">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 text-lg py-6"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              onClick={() => handleSendMessage()}
              size="lg"
              className="bg-[#00BFA6] hover:bg-[#00BFA6]/90 px-8"
            >
              <Bot className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="flex gap-2 flex-1"
              onClick={handleUpload}
            >
              <Upload className="h-5 w-5" />
              Upload File
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex gap-2 flex-1"
              onClick={handleLinkData}
            >
              <Link className="h-5 w-5" />
              Link Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
