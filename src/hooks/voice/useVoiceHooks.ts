
import { useState, useRef, useCallback, useEffect } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSilenceDetection } from "./useSilenceDetection";
import { useRecognitionHandlers } from "./useRecognitionHandlers";
import { useToast } from "@/hooks/use-toast";

export const useVoiceInput = (onTranscript: (text: string, isFinal: boolean) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const messageProcessingRef = useRef<boolean>(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRecoveryModeRef = useRef<boolean>(false);
  
  const { recognitionRef, toast, isSupported, restartRecognition, resetRestartAttempts } = useSpeechRecognition();

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
    };
  }, []);

  const handleSilenceDetected = useCallback((transcript: string) => {
    messageProcessingRef.current = true;
    onTranscript(transcript, true);
    setInterimTranscript("");
    
    processingTimeoutRef.current = setTimeout(() => {
      messageProcessingRef.current = false;
    }, 2000);
  }, [onTranscript]);

  const { detectSilence, silenceTimerRef } = useSilenceDetection({
    onSilenceDetected: handleSilenceDetected,
    isListening,
    interimTranscript,
    messageProcessingRef
  });

  const { setupRecognitionHandlers } = useRecognitionHandlers({
    recognitionRef,
    toast,
    isListening,
    setIsListening,
    interimTranscript,
    setInterimTranscript,
    detectSilence,
    handleSilenceDetected,
    messageProcessingRef,
    silenceTimerRef,
    recoveryTimeoutRef,
    isRecoveryModeRef,
    restartRecognition,
    resetRestartAttempts,
    onTranscript
  });

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
  }, [isSupported, setupRecognitionHandlers, toast, recognitionRef]);

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
  }, [interimTranscript, handleSilenceDetected, recognitionRef]);

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

  return { isListening, toggleListening, interimTranscript };
};
