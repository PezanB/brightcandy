
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseTextToSpeechOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  rate?: number;
  pitch?: number;
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { voice = 'nova', rate = 1.0, pitch = 1.0 } = options;
  const pendingTextRef = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      audioRef.current.onended = () => {
        console.log('Audio playback completed successfully');
        setIsSpeaking(false);
        isProcessingRef.current = false;
      };
      
      audioRef.current.onpause = () => {
        console.log('Audio playback paused');
        setIsSpeaking(false);
      };
      
      audioRef.current.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        isProcessingRef.current = false;
        
        // Auto-retry with browser TTS on audio error
        if (pendingTextRef.current) {
          const textToSpeak = pendingTextRef.current;
          pendingTextRef.current = null;
          
          setTimeout(() => {
            speakWithBrowser(textToSpeak);
          }, 300);
        }
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Enhanced browser-based TTS function
  const speakWithBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Browser does not support speech synthesis');
      return;
    }

    console.log('Using browser TTS fallback');
    
    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices and try to select a good one
    let voices = window.speechSynthesis.getVoices();
    
    // If voices array is empty, wait for voiceschanged event
    if (voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        voices = window.speechSynthesis.getVoices();
        selectVoiceAndSpeak();
      }, { once: true });
    } else {
      selectVoiceAndSpeak();
    }
    
    function selectVoiceAndSpeak() {
      // Prefer higher quality voices when available, prioritize more natural sounding ones
      const voicePreferences = [
        // Google voices are usually high quality
        (v: SpeechSynthesisVoice) => /Google UK English Female/.test(v.name),
        (v: SpeechSynthesisVoice) => /Google UK English Male/.test(v.name),
        (v: SpeechSynthesisVoice) => /Google US English/.test(v.name),
        
        // Microsoft voices are also good
        (v: SpeechSynthesisVoice) => /Microsoft Zira/.test(v.name),
        (v: SpeechSynthesisVoice) => /Microsoft David/.test(v.name),
        
        // Apple voices
        (v: SpeechSynthesisVoice) => /Samantha/.test(v.name),
        (v: SpeechSynthesisVoice) => /Daniel/.test(v.name),
        
        // Any English voice
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.localService === false,
        
        // Default to any voice if nothing else matches
        (v: SpeechSynthesisVoice) => true
      ];
      
      let selectedVoice = null;
      for (const preference of voicePreferences) {
        selectedVoice = voices.find(preference);
        if (selectedVoice) break;
      }
      
      if (selectedVoice) {
        console.log('Using voice:', selectedVoice.name);
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      utterance.onstart = () => {
        console.log('Browser speech synthesis started');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('Browser speech synthesis ended');
        setIsSpeaking(false);
        isProcessingRef.current = false;
        
        // Check for pending text after speech ends
        if (pendingTextRef.current) {
          const pendingText = pendingTextRef.current;
          pendingTextRef.current = null;
          
          setTimeout(() => {
            speak(pendingText);
          }, 300);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        isProcessingRef.current = false;
      };
      
      // Split text into sentences for more natural pauses
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      
      if (sentences.length > 1 && sentences.length < 20) {
        // For multiple sentences, speak each with a slight pause
        sentences.forEach((sentence, index) => {
          const sentenceUtterance = new SpeechSynthesisUtterance(sentence.trim());
          if (selectedVoice) sentenceUtterance.voice = selectedVoice;
          sentenceUtterance.rate = rate;
          sentenceUtterance.pitch = pitch;
          
          // Only set events for first and last utterance to avoid callback spam
          if (index === 0) {
            sentenceUtterance.onstart = utterance.onstart;
          }
          
          if (index === sentences.length - 1) {
            sentenceUtterance.onend = utterance.onend;
            sentenceUtterance.onerror = utterance.onerror;
          }
          
          setTimeout(() => {
            window.speechSynthesis.speak(sentenceUtterance);
          }, index * 100); // Small delay between sentences
        });
      } else {
        // For single sentence or very long text, use a single utterance
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [rate, pitch]);

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
    retryCountRef.current = 0;
    
    try {
      // Try to use Supabase Edge function for TTS
      const { data, error } = await supabase.functions.invoke('tts', {
        body: { text, voice }
      });

      if (error) {
        console.error(`Supabase TTS error:`, error);
        throw new Error(`Supabase TTS error: ${JSON.stringify(error)}`);
      }

      if (data && data.audioContent) {
        if (audioRef.current) {
          // Stop any current audio
          audioRef.current.pause();
          
          // Create audio source from base64
          const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
          audioRef.current.src = audioSrc;
          
          // Pre-load the audio to catch any loading errors early
          audioRef.current.load();
          
          // Add a loading timeout in case audio fails to load
          const loadingTimeout = setTimeout(() => {
            console.warn('Audio loading timeout, falling back to browser TTS');
            speakWithBrowser(text);
          }, 3000);
          
          // Wait for audio to be ready
          audioRef.current.oncanplaythrough = async () => {
            clearTimeout(loadingTimeout);
            
            try {
              setIsSpeaking(true);
              await audioRef.current?.play();
            } catch (playError) {
              console.error('Error playing audio:', playError);
              speakWithBrowser(text);
            }
          };
        }
      } else {
        throw new Error('No audio data received from Edge Function');
      }
    } catch (error) {
      console.error('Edge Function failed, using browser TTS fallback:', error);
      
      // Only retry with the Edge Function if we haven't exceeded max retries
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`Retrying TTS (attempt ${retryCountRef.current} of ${maxRetries})...`);
        
        // Brief delay before retry
        setTimeout(() => {
          isProcessingRef.current = false;
          speak(text);
        }, 500);
        return;
      }
      
      // After max retries, fall back to browser TTS
      speakWithBrowser(text);
      
      // Show a toast notification about the fallback
      if (retryCountRef.current >= maxRetries) {
        toast("Using browser text-to-speech as a fallback");
      }
    } finally {
      // If there's pending text, speak it after the current one finishes
      // This is handled in the onended/onerror callbacks
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
    isProcessingRef.current = false;
  }, []);

  return { speak, isSpeaking, stopSpeaking };
};
