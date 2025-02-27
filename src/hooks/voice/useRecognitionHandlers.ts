
import { useCallback } from "react";

interface UseRecognitionHandlersProps {
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>;
  toast: any;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  interimTranscript: string;
  setInterimTranscript: (transcript: string) => void;
  detectSilence: () => void;
  handleSilenceDetected: (transcript: string) => void;
  messageProcessingRef: React.MutableRefObject<boolean>;
  silenceTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  recoveryTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  isRecoveryModeRef: React.MutableRefObject<boolean>;
  restartRecognition: () => boolean;
  resetRestartAttempts: () => void;
  onTranscript: (text: string, isFinal: boolean) => void;
}

export const useRecognitionHandlers = ({
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
}: UseRecognitionHandlersProps) => {
  
  const setupRecognitionHandlers = useCallback(() => {
    if (!recognitionRef.current) return;
    
    const recognition = recognitionRef.current;

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setIsListening(true);
      setInterimTranscript("");
      isRecoveryModeRef.current = false;
      resetRestartAttempts();
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      
      if (interimTranscript && !messageProcessingRef.current) {
        console.log("Finalizing transcript on recognition end:", interimTranscript);
        handleSilenceDetected(interimTranscript);
      }
      
      // Only attempt auto-restart if we're still supposed to be listening
      // and we're not in recovery mode
      if (isListening && !isRecoveryModeRef.current) {
        isRecoveryModeRef.current = true;
        console.log("Recognition ended unexpectedly, attempting recovery...");
        
        // Attempt to restart after a short delay
        recoveryTimeoutRef.current = setTimeout(() => {
          restartRecognition();
          isRecoveryModeRef.current = false;
        }, 300);
      } else {
        setIsListening(false);
      }
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      
      // Handle specific error types
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use the voice input feature.",
          variant: "destructive",
        });
        setIsListening(false);
      } else if (event.error === "aborted") {
        // This is often a temporary error that can be recovered from
        console.log("Recognition aborted, may attempt recovery");
        // Recovery will be handled in onend
      } else if (event.error === "network") {
        toast({
          title: "Network error",
          description: "There was a problem with your network connection.",
          variant: "destructive",
        });
        setIsListening(false);
      } else {
        toast({
          title: "Speech recognition error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
        
        // For any other errors, we'll stop listening
        if (event.error !== "aborted") {
          setIsListening(false);
        }
      }
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };

    recognition.onresult = (event) => {
      console.log("Speech recognition result received", event);
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      detectSilence();

      if (interim && !messageProcessingRef.current) {
        console.log("Interim transcript:", interim);
        setInterimTranscript(interim);
        onTranscript(interim, false);
      }

      if (final && !messageProcessingRef.current) {
        console.log("Final transcript:", final);
        handleSilenceDetected(final);
      }
    };
  }, [
    recognitionRef,
    onTranscript, 
    toast, 
    interimTranscript, 
    detectSilence, 
    handleSilenceDetected, 
    isListening, 
    restartRecognition, 
    resetRestartAttempts,
    setIsListening,
    setInterimTranscript,
    messageProcessingRef,
    silenceTimerRef,
    recoveryTimeoutRef,
    isRecoveryModeRef
  ]);

  return { setupRecognitionHandlers };
};
