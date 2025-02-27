
import { Button } from "@/components/ui/button";
import { MicIcon } from "lucide-react";
import { FC } from "react";

interface VoiceInputButtonProps {
  isListening: boolean;
  toggleListening: () => void;
  isProcessingVoiceInput: boolean;
}

export const VoiceInputButton: FC<VoiceInputButtonProps> = ({
  isListening,
  toggleListening,
  isProcessingVoiceInput
}) => {
  return (
    <Button
      variant={isListening ? "default" : "outline"}
      size="icon"
      onClick={toggleListening}
      className={`flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
        isListening ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white animate-pulse" : ""
      }`}
      disabled={isProcessingVoiceInput}
    >
      <MicIcon className="h-4 w-4" />
    </Button>
  );
};
