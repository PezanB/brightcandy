
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceInput = (onTranscript: (text: string, isFinal: boolean) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const { toast } = useToast();
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechRef = useRef<number>(0);
  const messageProcessingRef = useRef<boolean>(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Function to detect silence and finalize transcript
  const detectSilence = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    lastSpeechRef.current = Date.now();
    
    silenceTimerRef.current = setTimeout(() => {
      console.log("Silence detected, finalizing transcript");
      if (interimTranscript && isListening && !messageProcessingRef.current) {
        console.log("Finalizing transcript due to silence:", interimTranscript);
        messageProcessingRef.current = true;
        
        // Ensure we only process the message once
        onTranscript(interimTranscript, true);
        setInterimTranscript("");
        
        // Reset processing flag after a delay to prevent rapid re-processing
        processingTimeoutRef.current = setTimeout(() => {
          messageProcessingRef.current = false;
        }, 2000); // 2 second cooldown
      }
    }, 1500); // 1.5s of silence triggers finalization
  }, [interimTranscript, isListening, onTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized");
      return;
    }

    // Reset message processing flag
    messageProcessingRef.current = false;
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    try {
      const recognition = recognitionRef.current;

      // Set up event handlers each time we start listening
      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setInterimTranscript("");
        lastSpeechRef.current = Date.now();
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        
        // If there's still interim transcript when recognition ends,
        // finalize it (but only if we're not already processing)
        if (interimTranscript && !messageProcessingRef.current) {
          console.log("Finalizing transcript on recognition end:", interimTranscript);
          messageProcessingRef.current = true;
          onTranscript(interimTranscript, true);
          
          // Reset processing flag after a delay
          processingTimeoutRef.current = setTimeout(() => {
            messageProcessingRef.current = false;
          }, 2000); // 2 second cooldown
        }
        
        setIsListening(false);
        
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
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

        // Reset silence timer since we received speech
        detectSilence();

        if (interim && !messageProcessingRef.current) {
          console.log("Interim transcript:", interim);
          setInterimTranscript(interim);
          onTranscript(interim, false);
        }

        if (final && !messageProcessingRef.current) {
          console.log("Final transcript:", final);
          messageProcessingRef.current = true;
          setInterimTranscript("");
          onTranscript(final, true);
          
          // Reset processing flag after a delay
          processingTimeoutRef.current = setTimeout(() => {
            messageProcessingRef.current = false;
          }, 2000); // 2 second cooldown
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
  }, [onTranscript, toast, interimTranscript, detectSilence]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Speech recognition stopped");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    
    // Make sure to process any remaining transcript
    if (interimTranscript && !messageProcessingRef.current) {
      console.log("Processing remaining transcript on stop:", interimTranscript);
      messageProcessingRef.current = true;
      onTranscript(interimTranscript, true);
      setInterimTranscript("");
      
      // Reset processing flag after a delay
      processingTimeoutRef.current = setTimeout(() => {
        messageProcessingRef.current = false;
      }, 2000); // 2 second cooldown
    }
    
    setIsListening(false);
  }, [interimTranscript, onTranscript]);

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
