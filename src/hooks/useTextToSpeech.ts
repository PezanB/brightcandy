
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTextToSpeechOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { voice = 'nova' } = options;
  const pendingTextRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };
      audioRef.current.onpause = () => {
        setIsSpeaking(false);
      };
      audioRef.current.onerror = () => {
        console.error('Audio playback error');
        setIsSpeaking(false);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Browser-based TTS fallback
  const speakWithBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Browser does not support speech synthesis');
      return;
    }

    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices and try to select a good one
    const voices = window.speechSynthesis.getVoices();
    
    // Prefer higher quality voices when available
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Daniel') || 
      v.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      isProcessingRef.current = false;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      isProcessingRef.current = false;
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text: string) => {
    // Prevent speaking empty text
    if (!text || text.trim() === '') {
      console.log('Empty text provided to speak function, ignoring');
      return;
    }

    // If already speaking or processing, store the text to speak later
    if (isSpeaking || isProcessingRef.current) {
      console.log('Already speaking or processing, queuing text for later');
      pendingTextRef.current = text;
      return;
    }

    isProcessingRef.current = true;
    
    try {
      // Try to use Supabase Edge function for TTS
      const { data, error } = await supabase.functions.invoke('tts', {
        body: { text, voice }
      });

      if (error) {
        throw new Error(`Supabase TTS error: ${JSON.stringify(error)}`);
      }

      if (data && data.audioContent) {
        if (audioRef.current) {
          // Stop any current audio
          audioRef.current.pause();
          
          // Create audio source from base64
          const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
          audioRef.current.src = audioSrc;
          
          setIsSpeaking(true);
          await audioRef.current.play();
        }
      } else {
        throw new Error('No audio data received from Edge Function');
      }
    } catch (error) {
      console.error('Edge Function failed, using browser TTS fallback:', error);
      speakWithBrowser(text);
    } finally {
      isProcessingRef.current = false;
      
      // If there's pending text, speak it after a short delay
      if (pendingTextRef.current) {
        const pendingText = pendingTextRef.current;
        pendingTextRef.current = null;
        
        setTimeout(() => {
          speak(pendingText);
        }, 500);
      }
    }
  }, [voice, isSpeaking, speakWithBrowser]);

  const stopSpeaking = useCallback(() => {
    // Clear any pending text
    pendingTextRef.current = null;
    
    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop browser speech synthesis
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, stopSpeaking };
};
