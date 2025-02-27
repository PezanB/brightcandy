
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Message } from "@/types/chat";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  // Function to format text with proper line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div
      className={`flex items-start gap-3 ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.sender === "assistant" && (
        <Avatar className="h-10 w-10 ring-2 ring-[#2691A4] ring-offset-2 flex items-center justify-center">
          <img
            src="/lovable-uploads/f21d289d-7bcd-4050-acf9-4a8c18eeb24e.png"
            alt="Assistant"
            className="h-8 w-8 object-contain"
          />
        </Avatar>
      )}
      <Card
        className={`p-4 max-w-[80%] rounded-xl whitespace-pre-wrap ${
          message.sender === "user"
            ? "bg-[#0086C9] text-white"
            : "bg-secondary"
        }`}
      >
        {formatText(message.text)}
      </Card>
      {message.sender === "user" && (
        <Avatar className="h-10 w-10">
          <AvatarImage src="/lovable-uploads/b67eae23-4b47-4419-951a-1f87a4e7eb5f.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
