
import { useRef, useCallback } from "react";

interface SilenceDetectionProps {
  onSilenceDetected: (transcript: string) => void;
  isListening: boolean;
  interimTranscript: string;
  messageProcessingRef: React.MutableRefObject<boolean>;
}

export const useSilenceDetection = ({
  onSilenceDetected,
  isListening,
  interimTranscript,
  messageProcessingRef
}: SilenceDetectionProps) => {
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechRef = useRef<number>(0);
  const silenceThreshold = 1500; // 1.5s of silence triggers finalization

  const detectSilence = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    lastSpeechRef.current = Date.now();
    
    // Only set up silence detection if we have some transcript to finalize
    if (interimTranscript && isListening && !messageProcessingRef.current) {
      silenceTimerRef.current = setTimeout(() => {
        const silenceDuration = Date.now() - lastSpeechRef.current;
        
        // Double-check we still have something to finalize and we're still in the right state
        if (silenceDuration >= silenceThreshold && 
            interimTranscript && 
            isListening && 
            !messageProcessingRef.current) {
          console.log("Silence detected, finalizing transcript");
          onSilenceDetected(interimTranscript);
        }
      }, silenceThreshold);
    }
  }, [interimTranscript, isListening, onSilenceDetected, messageProcessingRef]);

  const cancelSilenceDetection = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  return {
    detectSilence,
    cancelSilenceDetection,
    silenceTimerRef,
    lastSpeechRef
  };
};
