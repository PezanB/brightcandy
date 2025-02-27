
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);

      // Try using the browser's built-in speech synthesis as a fallback
      if ('speechSynthesis' in window) {
        try {
          const { data, error } = await supabase.functions.invoke('text-to-voice', {
            body: {
              text,
              voice: 'alloy' // Using OpenAI's default voice
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
          
          // Use browser's built-in speech synthesis as fallback
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => {
            setIsSpeaking(false);
          };
          
          window.speechSynthesis.cancel(); // Cancel any ongoing speech
          window.speechSynthesis.speak(utterance);
        }
      } else {
        throw new Error('Speech synthesis not supported in this browser');
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
  }, [toast]);

  return { speak, isSpeaking };
};
