
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceInput = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported by browser");
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    // Event handlers
    recognitionInstance.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      
      if (event.error === "not-allowed") {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access to use the voice input feature.",
          variant: "destructive",
        });
      }
    };

    recognitionInstance.onresult = (event) => {
      let currentTranscript = '';
      
      // Get all results, including interim
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          currentTranscript += transcript;
        } else {
          // Update the interim transcript in state
          setInterimTranscript(transcript);
          // Pass interim results to the parent component
          onTranscript(transcript);
        }
      }
      
      // If we have final results, update the transcript
      if (currentTranscript) {
        onTranscript(currentTranscript);
      }
    };

    setRecognition(recognitionInstance);

    // Cleanup
    return () => {
      if (recognitionInstance) {
        recognitionInstance.onend = null;
        recognitionInstance.onstart = null;
        recognitionInstance.onresult = null;
        recognitionInstance.onerror = null;
        if (isListening) {
          recognitionInstance.stop();
        }
      }
    };
  }, [onTranscript, toast]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Speech recognition not available",
        description: "Your browser doesn't support this feature.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      toast({
        title: "Listening",
        description: "Speak now to input your message.",
      });
    }
  }, [recognition, isListening, toast]);

  return { isListening, toggleListening, interimTranscript };
};
