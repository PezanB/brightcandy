
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Message } from "@/types/chat";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  // Function to format text with proper line breaks and number formatting
  const formatText = (text: string) => {
    // Format numbers in the text
    const formattedText = text.replace(/\b\d+(\.\d+)?\b/g, (match) => {
      const num = parseFloat(match);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num);
      }
      return match;
    });

    return formattedText.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div
      className={`flex items-start gap-4 ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.sender === "assistant" && (
        <Avatar className="h-8 w-8 ring-2 ring-[#2691A4] ring-offset-2 flex-shrink-0 mt-1">
          <img
            src="/lovable-uploads/f21d289d-7bcd-4050-acf9-4a8c18eeb24e.png"
            alt="Assistant"
            className="h-6 w-6 object-contain"
          />
        </Avatar>
      )}
      <Card
        className={`px-4 py-3 max-w-[80%] rounded-xl whitespace-pre-wrap shadow-md transition-all duration-300 ${
          message.sender === "user"
            ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:shadow-lg"
            : "bg-gradient-to-br from-white to-[#EDF7F9] hover:shadow-lg"
        }`}
      >
        {formatText(message.text)}
      </Card>
      {message.sender === "user" && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
          <AvatarImage src="/lovable-uploads/b67eae23-4b47-4419-951a-1f87a4e7eb5f.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
