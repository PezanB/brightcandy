
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceInput = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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

    recognitionRef.current = recognitionInstance;

    return () => {
      stopListening();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized");
      return;
    }

    try {
      const recognition = recognitionRef.current;

      // Set up event handlers each time we start listening
      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        
        if (event.error === "not-allowed") {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use the voice input feature.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Speech recognition error",
            description: `Error: ${event.error}`,
            variant: "destructive",
          });
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

        if (interim) {
          console.log("Interim transcript:", interim);
          setInterimTranscript(interim);
          onTranscript(interim);
        }

        if (final) {
          console.log("Final transcript:", final);
          setInterimTranscript("");
          onTranscript(final);
        }
      };

      // Start the recognition
      recognition.start();
      
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
  }, [onTranscript, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Speech recognition stopped");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
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
  }, [isListening, startListening, stopListening, toast]);

  return { isListening, toggleListening, interimTranscript };
};
