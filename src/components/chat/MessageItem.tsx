
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Message } from "@/types/chat";
import { useState, useEffect } from "react";

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Function to format numbers in text
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  useEffect(() => {
    if (message.sender === "assistant") {
      setIsTyping(true);
      setDisplayText("");
      let currentIndex = 0;
      const text = message.text;

      const typeNextCharacter = () => {
        if (currentIndex < text.length) {
          setDisplayText(text.substring(0, currentIndex + 1));
          currentIndex++;
          const delay = text[currentIndex - 1] === '\n' ? 100 : Math.random() * 20 + 10;
          setTimeout(typeNextCharacter, delay);
        } else {
          setIsTyping(false);
        }
      };

      typeNextCharacter();
    } else {
      setDisplayText(message.text);
    }

    return () => {
      setIsTyping(false);
      setDisplayText("");
    };
  }, [message.text, message.sender]);

  // Function to format text with proper line breaks and number formatting
  const formatText = (text: string) => {
    // Format numbers in the text
    const formattedText = text.replace(/\b\d+(\.\d+)?\b/g, (match) => {
      const num = parseFloat(match);
      return !isNaN(num) ? formatNumber(num) : match;
    });

    return formattedText.split('\n').map((line, index, array) => (
      <span key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div
      className={`flex items-start gap-2 ${
        message.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {message.sender === "assistant" && (
        <Avatar className="h-7 w-7 ring-2 ring-[#2691A4] ring-offset-1 flex-shrink-0">
          <div className="flex items-center justify-center w-full h-full">
            <img
              src="/lovable-uploads/f21d289d-7bcd-4050-acf9-4a8c18eeb24e.png"
              alt="Assistant"
              className="h-5 w-5 object-contain"
            />
          </div>
        </Avatar>
      )}
      <Card
        className={`px-3 py-2 max-w-[80%] rounded-xl whitespace-pre-wrap shadow-sm transition-all duration-300 ${
          message.sender === "user"
            ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:shadow-md"
            : "bg-gradient-to-br from-white to-[#EDF7F9] hover:shadow-md"
        }`}
      >
        {formatText(displayText)}
        {isTyping && (
          <span className="inline-block w-2 h-4 ml-1 bg-[#2691A4] animate-pulse" />
        )}
      </Card>
      {message.sender === "user" && (
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src="/lovable-uploads/b67eae23-4b47-4419-951a-1f87a4e7eb5f.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
