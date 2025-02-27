
import { useCallback, useRef, useState } from "react";
import { useConversation } from "@11labs/react";

export const useElevenLabsIntegration = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const pendingTextRef = useRef<string | null>(null);
  const processedTextsRef = useRef<Set<string>>(new Set());
  
  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log("ElevenLabs connection established");
      setIsInitialized(true);
    },
    onDisconnect: () => {
      console.log("ElevenLabs connection closed");
      setIsInitialized(false);
    },
    onMessage: (message) => {
      console.log("ElevenLabs message:", message);
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
    },
    overrides: {
      tts: {
        voiceId: "EXAVITQu4vr4xnSDxMaL" // Sarah voice
      }
    }
  });

  // Get the ElevenLabs isSpeaking state
  const elevenlabsSpeaking = conversation.isSpeaking;

  // Update our local isSpeaking state based on ElevenLabs
  useState(() => {
    setIsSpeaking(elevenlabsSpeaking);
  }, [elevenlabsSpeaking]);

  // Start a conversation with the provided text
  const speak = useCallback(async (text: string) => {
    if (!text || text.trim() === '') {
      console.log('Empty text provided to speak function, ignoring');
      return;
    }

    const normalizedText = text.trim();
    
    if (processedTextsRef.current.has(normalizedText)) {
      console.log('Text was already processed recently, preventing loop');
      return;
    }
    
    if (elevenlabsSpeaking) {
      console.log('Already speaking, queuing text for later');
      pendingTextRef.current = normalizedText;
      return;
    }

    processedTextsRef.current.add(normalizedText);
    if (processedTextsRef.current.size > 50) {
      const iterator = processedTextsRef.current.values();
      processedTextsRef.current.delete(iterator.next().value);
    }

    try {
      // Start ElevenLabs conversation if not already initialized
      if (!isInitialized) {
        await conversation.startSession({
          agentId: "default" // Replace with your actual agent ID if needed
        });
      }
      
      // Send text to ElevenLabs
      // This is a simple message - in a real implementation you'd use their message system
      console.log(`Speaking text via ElevenLabs: ${normalizedText}`);
      setIsSpeaking(true);
      
      // For now, we're just simulating the speaking process
      // In a real implementation, you'd send this to ElevenLabs
      setTimeout(() => {
        setIsSpeaking(false);
        
        // Process any pending text
        if (pendingTextRef.current) {
          const pendingText = pendingTextRef.current;
          pendingTextRef.current = null;
          speak(pendingText);
        }
      }, 2000);
      
    } catch (error) {
      console.error("Error speaking with ElevenLabs:", error);
      setIsSpeaking(false);
    }
  }, [conversation, elevenlabsSpeaking, isInitialized]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    pendingTextRef.current = null;
    setIsSpeaking(false);
    
    // End the ElevenLabs session
    if (isInitialized) {
      conversation.endSession();
    }
    
    processedTextsRef.current.clear();
  }, [conversation, isInitialized]);

  return { 
    speak, 
    isSpeaking, 
    stopSpeaking,
    elevenlabsStatus: conversation.status
  };
};
