
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { FC } from "react";

interface SendButtonProps {
  handleSendMessage: () => void;
  disabled: boolean;
  className?: string;
}

export const SendButton: FC<SendButtonProps> = ({
  handleSendMessage,
  disabled,
  className
}) => {
  return (
    <Button
      onClick={handleSendMessage}
      disabled={disabled}
      className={`flex-shrink-0 bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity rounded-xl shadow-md hover:shadow-lg transition-shadow ${className || ""}`}
    >
      <SendIcon className="h-4 w-4" />
    </Button>
  );
};

export type { SendButtonProps };
