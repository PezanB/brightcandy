
import { useState, useRef, useCallback, useEffect } from "react";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSilenceDetection } from "./useSilenceDetection";
import { useRecognitionHandlers } from "./useRecognitionHandlers";
import { useListeningControls } from "./useListeningControls";

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

  const { toggleListening } = useListeningControls({
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
  });

  return { isListening, toggleListening, interimTranscript };
};
