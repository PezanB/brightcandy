
import { useState } from "react";
import { Send, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I can help you setup the data sources for the team to be able to access the correct data at all times, should I guide you now?",
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleUpload = () => {
    toast({
      title: "Upload feature",
      description: "File upload functionality will be implemented here",
    });
  };

  const handleLinkData = () => {
    toast({
      title: "Link data",
      description: "Data linking functionality will be implemented here",
    });
  };

  return (
    <div className="flex flex-col h-screen max-h-[calc(100vh-64px)]">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold">How can I help you today?</h1>
            <p className="text-muted-foreground mt-2">
              Empowering sales teams with generative AI and advanced modeling for data-driven decisions
            </p>
          </div>

          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "flex-row" : "flex-row"
                }`}
              >
                {message.sender === "assistant" && (
                  <Avatar className="h-10 w-10 ring-2 ring-[#0086C9] ring-offset-2 flex items-center justify-center">
                    <img
                      src="/lovable-uploads/5cc17fd4-a9e4-479d-a276-95baf79bea04.png"
                      alt="Assistant"
                      className="h-8 w-8 object-contain"
                    />
                  </Avatar>
                )}
                <Card
                  className={`p-4 max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-[#0086C9] text-white"
                      : "bg-secondary"
                  }`}
                >
                  <p>{message.text}</p>
                </Card>
                {message.sender === "user" && (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

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
              Upload File
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLinkData}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              Link Data Source
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
