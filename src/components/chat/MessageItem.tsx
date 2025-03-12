import { Message } from "@/types/chat";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, Volume2, VolumeX } from "lucide-react";
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

  // Format the message text with proper spacing and line breaks
  const formattedText = text.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </span>
  ));

  return (
    <div
      className={cn(
        "flex w-full gap-2 mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className="flex-shrink-0 mt-1">
        <Avatar className={cn("h-10 w-10 border-2", isUser ? "border-[#36B9D3]" : "border-gray-200")}>
          {isUser ? (
            <AvatarImage 
              src="/lovable-uploads/b67eae23-4b47-4419-951a-1f87a4e7eb5f.png" 
              alt="User" 
              className="h-full w-full"
            />
          ) : (
            <AvatarImage 
              src="/lovable-uploads/f2bbc74a-0c34-4460-b5e4-5a3acb885e81.png" 
              alt="BrightCandy AI" 
              className="h-full w-full object-contain"
            />
          )}
          {/* Fallback for if images don't load */}
          {isUser ? (
            <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-r from-[#2691A4] to-[#36B9D3]")}>
              <User className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
            </div>
          )}
        </Avatar>
        {isUser && (
          <div className="w-2 h-2 rounded-full bg-green-500 ml-auto mr-0 -mt-2 border border-white"></div>
        )}
      </div>

      <div className={cn("flex flex-col max-w-[75%]")}>
        <div
          className={cn(
            "py-3 px-4 rounded-2xl shadow-sm whitespace-pre-wrap",
            isUser
              ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white rounded-tr-none"
              : "bg-white text-gray-800 rounded-tl-none"
          )}
        >
          <div className="whitespace-pre-wrap text-sm prose prose-sm max-w-none">
            {formattedText}
          </div>
        </div>
        <div className={cn("flex items-center mt-1 text-xs text-muted-foreground", 
          isUser ? "justify-end" : "justify-start")}>
          <span>
            {format(new Date(timestamp), "h:mm a")}
          </span>
          
          {!isUser && onSpeakMessage && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 ml-2 hover:bg-gray-100" 
              onClick={isSpeaking ? onStopSpeaking : onSpeakMessage}
              title={isSpeaking ? "Stop speaking" : "Speak this message"}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
