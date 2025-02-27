
import { Button } from "@/components/ui/button";
import { PaperclipIcon, LinkIcon } from "lucide-react";
import { FC } from "react";
import { VoiceInputButton } from "./VoiceInputButton";
import { AutoSpeakButton } from "./AutoSpeakButton";

interface ActionButtonsProps {
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLinkData: () => void;
  isListening: boolean;
  toggleListening: () => void;
  isProcessingVoiceInput: boolean;
  autoSpeakEnabled?: boolean;
  onToggleAutoSpeak?: () => void;
}

export const ActionButtons: FC<ActionButtonsProps> = ({
  handleUpload,
  handleLinkData,
  isListening,
  toggleListening,
  isProcessingVoiceInput,
  autoSpeakEnabled,
  onToggleAutoSpeak
}) => {
  return (
    <div className="flex gap-2">
      <input
        type="file"
        id="data-upload"
        className="hidden"
        accept=".json,.xlsx,.xls,.csv"
        multiple
        onChange={handleUpload}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={() => document.getElementById('data-upload')?.click()}
        className="flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-shadow"
      >
        <PaperclipIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleLinkData}
        className="flex-shrink-0 rounded-xl shadow-md hover:shadow-lg transition-shadow"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <VoiceInputButton 
        isListening={isListening} 
        toggleListening={toggleListening} 
        isProcessingVoiceInput={isProcessingVoiceInput}
      />
      <AutoSpeakButton 
        autoSpeakEnabled={autoSpeakEnabled} 
        onToggleAutoSpeak={onToggleAutoSpeak}
      />
    </div>
  );
};
