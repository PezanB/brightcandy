
import { useState, useEffect } from "react";
import { fetchApiKey, saveApiKey, DEFAULT_ELEVENLABS_API_KEY } from "@/utils/elevenlabs-api";

// Declare global Window interface extension
declare global {
  interface Window {
    ELEVENLABS_API_KEY?: string;
  }
}

export const useElevenLabsSetup = (userId: string | null) => {
  const [apiKeyFetched, setApiKeyFetched] = useState(false);
  
  useEffect(() => {
    const setupApiKey = async () => {
      if (!userId || apiKeyFetched) return;
      
      // If key is already in the window object, mark it as fetched
      if (window.ELEVENLABS_API_KEY) {
        setApiKeyFetched(true);
        console.log("ElevenLabs API key already loaded in window object");
        return;
      }
      
      // Fetch the ElevenLabs API key from localStorage
      const apiKey = await fetchApiKey(userId);
      
      if (apiKey) {
        // Use the existing API key
        window.ELEVENLABS_API_KEY = apiKey;
        setApiKeyFetched(true);
        console.log("ElevenLabs API key loaded from localStorage");
      } else {
        // No key found, save and use the default key
        const success = await saveApiKey(userId, DEFAULT_ELEVENLABS_API_KEY);
        if (success) {
          window.ELEVENLABS_API_KEY = DEFAULT_ELEVENLABS_API_KEY;
          setApiKeyFetched(true);
          console.log("Default ElevenLabs API key saved to localStorage");
        } else {
          console.error("Failed to save default API key to localStorage");
        }
      }
    };

    setupApiKey();
  }, [userId, apiKeyFetched]);

  return { apiKeyFetched };
};
