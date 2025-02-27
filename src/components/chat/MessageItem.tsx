
import { Message } from "@/types/chat";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Bot, User, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageItemProps {
  message: Message;
  isSpeaking?: boolean;
  onSpeakMessage?: () => void;
  onStopSpeaking?: () => void;
}

export const MessageItem = ({ message, isSpeaking, onSpeakMessage, onStopSpeaking }: MessageItemProps) => {
  const { text, sender, timestamp } = message;
  const isUser = sender === "user";

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-6 w-6">
            <div className="flex h-full w-full items-center justify-center bg-muted">
              {isUser ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {isUser ? "You" : "BrightCandy AI"} | {format(new Date(timestamp), "h:mm a")}
          </span>
          {!isUser && onSpeakMessage && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 hover:bg-gray-100" 
              onClick={isSpeaking ? onStopSpeaking : onSpeakMessage}
              title={isSpeaking ? "Stop speaking" : "Speak this message"}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <Card
          className={cn(
            "p-3 shadow-sm",
            isUser
              ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white"
              : "bg-white text-gray-800"
          )}
        >
          <div className="whitespace-pre-wrap text-sm">{text}</div>
        </Card>
      </div>
    </div>
  );
};
