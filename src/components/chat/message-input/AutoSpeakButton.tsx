
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { FC } from "react";

interface AutoSpeakButtonProps {
  autoSpeakEnabled?: boolean;
  onToggleAutoSpeak?: () => void;
  className?: string;
}

export const AutoSpeakButton: FC<AutoSpeakButtonProps> = ({
  autoSpeakEnabled,
  onToggleAutoSpeak,
  className
}) => {
  if (!onToggleAutoSpeak) return null;
  
  return (
    <Button
      variant={autoSpeakEnabled ? "default" : "outline"}
      size="icon"
      onClick={onToggleAutoSpeak}
      className={`flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
        autoSpeakEnabled ? "bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white" : ""
      } ${className || ""}`}
    >
      {autoSpeakEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
};

export type { AutoSpeakButtonProps };
