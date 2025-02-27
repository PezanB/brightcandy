
import { useState, useRef, useEffect } from "react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface UseVoiceControllerProps {
  setInputMessage: (message: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
}

export const useVoiceController = ({
  setInputMessage,
  handleSendMessage,
  isLoading
}: UseVoiceControllerProps) => {
  const [inputTimeout, setInputTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isVoiceInputComplete, setIsVoiceInputComplete] = useState(false);
  const [isProcessingVoiceInput, setIsProcessingVoiceInput] = useState(false);
  const lastFinalTranscriptRef = useRef<string>("");
  const sendMessageRef = useRef<() => void>(() => {});
  const inputRef = useRef<HTMLInputElement>(null);

  // Store the current handleSendMessage in a ref so we can access it inside timeouts
  useEffect(() => {
    sendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Function to handle sending voice input messages
  const sendVoiceMessage = (text: string) => {
    if (!text || isLoading) return;
    
    console.log("Preparing to send voice message:", text);
    // Set input message for display
    setInputMessage(text);
    
    // Wait a tick to ensure the input value is set before sending
    setTimeout(() => {
      console.log("Actually sending voice message:", text);
      sendMessageRef.current();
      // Reset tracking variables
      lastFinalTranscriptRef.current = "";
      setIsVoiceInputComplete(false);
      setIsProcessingVoiceInput(false);
    }, 50);
  };

  const handleVoiceTranscript = (text: string, isFinal: boolean) => {
    console.log("Voice transcript received:", text, "isFinal:", isFinal);
    
    // Update the input field with the current transcript
    setInputMessage(text);
    
    // Clear previous timeout if it exists
    if (inputTimeout) {
      clearTimeout(inputTimeout);
    }
    
    // If we have a final transcript and it's not empty
    if (isFinal && text.trim()) {
      // Prevent duplicate submissions of the same final transcript
      if (lastFinalTranscriptRef.current === text) {
        console.log("Duplicate final transcript detected, ignoring:", text);
        return;
      }
      
      // Mark this transcript as processed
      lastFinalTranscriptRef.current = text;
      setIsVoiceInputComplete(true);
      setIsProcessingVoiceInput(true);
      
      // Set a new timeout to send the message automatically after voice input stops
      const timeout = setTimeout(() => {
        if (text.trim()) {
          console.log("Auto-sending voice message now:", text);
          sendVoiceMessage(text);
        }
      }, 800); // Slightly shorter timeout for better responsiveness
      
      setInputTimeout(timeout);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (inputTimeout) {
        clearTimeout(inputTimeout);
      }
    };
  }, [inputTimeout]);

  const { isListening, toggleListening } = useVoiceInput((text, isFinal) => 
    handleVoiceTranscript(text, isFinal)
  );

  // Focus input when listening state changes
  useEffect(() => {
    if (isListening && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening]);

  // Auto-stop listening after message is sent
  useEffect(() => {
    if (isProcessingVoiceInput && isListening) {
      // Give a small delay to ensure the message is processed
      const stopListeningTimeout = setTimeout(() => {
        if (isListening) {
          console.log("Auto-stopping listening after message sent");
          toggleListening();
        }
      }, 300);
      
      return () => clearTimeout(stopListeningTimeout);
    }
  }, [isProcessingVoiceInput, isListening, toggleListening]);

  return {
    isListening,
    toggleListening,
    isVoiceInputComplete,
    isProcessingVoiceInput,
    inputRef
  };
};
