
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

  const detectSilence = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    lastSpeechRef.current = Date.now();
    
    silenceTimerRef.current = setTimeout(() => {
      console.log("Silence detected, finalizing transcript");
      if (interimTranscript && isListening && !messageProcessingRef.current) {
        console.log("Finalizing transcript due to silence:", interimTranscript);
        onSilenceDetected(interimTranscript);
      }
    }, 1500); // 1.5s of silence triggers finalization
  }, [interimTranscript, isListening, onSilenceDetected, messageProcessingRef]);

  return {
    detectSilence,
    silenceTimerRef,
    lastSpeechRef
  };
};
