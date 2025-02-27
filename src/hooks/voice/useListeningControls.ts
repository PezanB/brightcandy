
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseListeningControlsProps {
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>;
  isSupported: boolean;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  interimTranscript: string;
  messageProcessingRef: React.MutableRefObject<boolean>;
  processingTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  recoveryTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  isRecoveryModeRef: React.MutableRefObject<boolean>;
  setupRecognitionHandlers: () => void;
  handleSilenceDetected: (transcript: string) => void;
}

export const useListeningControls = ({
  recognitionRef,
  isSupported,
  isListening,
  setIsListening,
  interimTranscript,
  messageProcessingRef,
  processingTimeoutRef,
  recoveryTimeoutRef,
  isRecoveryModeRef,
  setupRecognitionHandlers,
  handleSilenceDetected
}: UseListeningControlsProps) => {
  const { toast } = useToast();

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized");
      return;
    }

    if (!isSupported) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support this feature.",
        variant: "destructive",
      });
      return;
    }

    messageProcessingRef.current = false;
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    try {
      // Set up event handlers
      setupRecognitionHandlers();
      
      // Start recognition
      recognitionRef.current.start();
      
      toast({
        title: "Listening",
        description: "Speak now to input your message.",
      });
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast({
        title: "Speech recognition failed",
        description: "Could not start the speech recognition system.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  }, [isSupported, setupRecognitionHandlers, toast, recognitionRef, messageProcessingRef, processingTimeoutRef, setIsListening]);

  const stopListening = useCallback(() => {
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
    
    isRecoveryModeRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Speech recognition stopped");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    
    if (interimTranscript && !messageProcessingRef.current) {
      console.log("Processing remaining transcript on stop:", interimTranscript);
      handleSilenceDetected(interimTranscript);
    }
    
    setIsListening(false);
  }, [interimTranscript, handleSilenceDetected, recognitionRef, recoveryTimeoutRef, isRecoveryModeRef, messageProcessingRef, setIsListening]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      toast({
        title: "Speech recognition not available",
        description: "Your browser doesn't support this feature.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening, toast, isSupported, recognitionRef]);

  return {
    startListening,
    stopListening,
    toggleListening
  };
};
