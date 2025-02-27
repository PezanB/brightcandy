
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useSpeechRecognition = () => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(true);
  const restartAttemptsRef = useRef(0);
  const maxRestartAttempts = 3;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported by browser");
      setIsSupported(false);
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support the speech recognition feature.",
        variant: "destructive",
      });
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    recognitionRef.current = recognitionInstance;
  }, [toast]);

  const restartRecognition = () => {
    if (!recognitionRef.current || restartAttemptsRef.current >= maxRestartAttempts) return false;
    
    try {
      restartAttemptsRef.current += 1;
      recognitionRef.current.start();
      console.log("Attempting to restart speech recognition");
      return true;
    } catch (error) {
      console.error("Failed to restart speech recognition:", error);
      return false;
    }
  };

  const resetRestartAttempts = () => {
    restartAttemptsRef.current = 0;
  };

  return { 
    recognitionRef, 
    toast, 
    isSupported, 
    restartRecognition, 
    resetRestartAttempts 
  };
};
