
import { useState, useRef, useCallback, useEffect } from "react";
import { useSpeechRecognition } from "./voice/useSpeechRecognition";
import { useSilenceDetection } from "./voice/useSilenceDetection";

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
  }, [onTranscript, toast, interimTranscript, detectSilence, handleSilenceDetected, isListening, restartRecognition, resetRestartAttempts]);

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
  }, [onTranscript, toast, isSupported, setupRecognitionHandlers]);

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
  }, [interimTranscript, handleSilenceDetected]);

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
  }, [isListening, startListening, stopListening, toast, isSupported]);

  return { isListening, toggleListening, interimTranscript };
};
