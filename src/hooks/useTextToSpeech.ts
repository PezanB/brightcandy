
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize voices on component mount
    if ('speechSynthesis' in window) {
      // Get available voices (they might load asynchronously)
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      };

      // Load voices on initial render
      loadVoices();

      // Handle asynchronous loading of voices
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const getBestVoice = () => {
    if (!voices.length) return null;

    // Preferred voices in order (premium high-quality voices first)
    const preferredVoices = [
      // Premium voices - these sound most natural
      voices.find(v => v.name.includes('Premium') && v.lang.startsWith('en')),
      // Enhanced quality voices
      voices.find(v => v.name.includes('Enhanced') && v.lang.startsWith('en')),
      // Google voices are generally good quality
      voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')),
      // Any English voice by name preference
      voices.find(v => v.name.includes('Samantha') && v.lang.startsWith('en')),
      voices.find(v => v.name.includes('Alex') && v.lang.startsWith('en')),
      // Fallback to any English voice
      voices.find(v => v.lang.startsWith('en')),
      // Final fallback to any voice
      voices[0]
    ];
    
    return preferredVoices.find(v => v !== undefined) || voices[0];
  };

  const speak = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);

      if (!text || text.trim().length === 0) {
        setIsSpeaking(false);
        return;
      }

      // Try using the Supabase edge function first
      try {
        const { data, error } = await supabase.functions.invoke('text-to-voice', {
          body: {
            text,
            voice: 'nova' // Using OpenAI's more natural-sounding voice
          }
        });

        if (error) throw error;

        // Convert base64 to audio and play
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        
        audio.onended = () => {
          setIsSpeaking(false);
        };

        await audio.play();
      } catch (error) {
        console.error('Edge Function failed, using browser TTS fallback:', error);
        
        // Fallback to browser's speech synthesis with improved naturalness
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Get the best available voice
          const bestVoice = getBestVoice();
          if (bestVoice) {
            utterance.voice = bestVoice;
          }
          
          // Adjust parameters for more natural speech
          utterance.rate = 0.95; // Slightly slower than default (1.0)
          utterance.pitch = 1.0; // Natural pitch
          utterance.volume = 1.0; // Full volume
          
          // Add slight pauses at punctuation for more natural rhythm
          text = text.replace(/([.,;:!?])/g, '$1 ');
          
          utterance.onend = () => {
            setIsSpeaking(false);
          };
          
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        } else {
          throw new Error('Speech synthesis not supported in this browser');
        }
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast({
        title: "Text-to-speech failed",
        description: "Could not convert text to speech. Please try again.",
        variant: "destructive",
      });
      setIsSpeaking(false);
    }
  }, [voices, toast]);

  return { speak, isSpeaking };
};
