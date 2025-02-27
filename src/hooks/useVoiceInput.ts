
import { useState, useRef, useCallback } from "react";
import { useSpeechRecognition } from "./voice/useSpeechRecognition";
import { useSilenceDetection } from "./voice/useSilenceDetection";

export const useVoiceInput = (onTranscript: (text: string, isFinal: boolean) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const messageProcessingRef = useRef<boolean>(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { recognitionRef, toast } = useSpeechRecognition();

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

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized");
      return;
    }

    messageProcessingRef.current = false;
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    try {
      const recognition = recognitionRef.current;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        
        if (interimTranscript && !messageProcessingRef.current) {
          console.log("Finalizing transcript on recognition end:", interimTranscript);
          handleSilenceDetected(interimTranscript);
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
  }, [onTranscript, toast, interimTranscript, detectSilence, handleSilenceDetected]);

  const stopListening = useCallback(() => {
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
  }, [interimTranscript, handleSilenceDetected]);

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
