
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
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio element and audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create audio element
      audioRef.current = new Audio();
      
      // Set up audio event handlers
      audioRef.current.onended = () => {
        console.log('Audio playback completed successfully');
        setIsSpeaking(false);
        isProcessingRef.current = false;
        
        // Check for pending text after speech ends
        setTimeout(() => {
          if (pendingTextRef.current) {
            const pendingText = pendingTextRef.current;
            pendingTextRef.current = null;
            speak(pendingText);
          }
        }, 100);
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
          }, 200);
        }
      };

      // Try to initialize AudioContext for better performance
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
        }
      } catch (e) {
        console.warn('AudioContext not supported, falling back to standard audio playback');
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
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
          }, 100);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        isProcessingRef.current = false;
      };
      
      // For shorter text, speak as a single utterance
      if (text.length < 300) {
        window.speechSynthesis.speak(utterance);
        return;
      }
      
      // For longer text, split into sentences for more natural pauses
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
          }, index * 50); // Small delay between sentences
        });
      } else {
        // Fall back to single utterance
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [rate, pitch]);

  // Function to play audio with optimized performance
  const playAudioOptimized = useCallback(async (audioSrc: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audioRef.current) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      // Use AudioContext if available for better performance
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        try {
          fetch(audioSrc)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContextRef.current!.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
              const source = audioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current!.destination);
              source.onended = () => {
                setIsSpeaking(false);
                isProcessingRef.current = false;
                resolve();
              };
              
              setIsSpeaking(true);
              source.start(0);
            })
            .catch(error => {
              console.error('Error with AudioContext playback:', error);
              // Fall back to standard audio element
              standardPlayback();
            });
        } catch (error) {
          console.error('AudioContext error:', error);
          standardPlayback();
        }
      } else {
        // Standard audio element playback
        standardPlayback();
      }

      function standardPlayback() {
        audioRef.current!.src = audioSrc;
        audioRef.current!.oncanplaythrough = async () => {
          try {
            setIsSpeaking(true);
            await audioRef.current!.play();
            resolve();
          } catch (error) {
            console.error('Error playing audio:', error);
            reject(error);
          }
        };
        audioRef.current!.load();
      }
    });
  }, []);

  // Main speech function with optimizations
  const speak = useCallback(async (text: string) => {
    // Skip empty text
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
      // For very short responses, use browser TTS for better responsiveness
      if (text.length < 50) {
        speakWithBrowser(text);
        return;
      }
      
      // Break long text into smaller chunks (OpenAI limit is 4096 chars)
      const textToProcess = text.length > 4000 ? text.substring(0, 4000) : text;
      
      // Try to use Supabase Edge function for TTS
      const { data, error } = await supabase.functions.invoke('tts', {
        body: { text: textToProcess, voice }
      });

      if (error) {
        console.error(`Supabase TTS error:`, error);
        throw new Error(`Supabase TTS error: ${JSON.stringify(error)}`);
      }

      if (data && data.audioContent) {
        // Create audio source from base64
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        
        // Add a loading timeout in case audio fails to load
        const loadingTimeout = setTimeout(() => {
          console.warn('Audio loading timeout, falling back to browser TTS');
          speakWithBrowser(text);
        }, 2000);
        
        try {
          await playAudioOptimized(audioSrc);
          clearTimeout(loadingTimeout);
        } catch (playError) {
          clearTimeout(loadingTimeout);
          console.error('Error playing audio:', playError);
          speakWithBrowser(text);
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
        }, 300);
        return;
      }
      
      // After max retries, fall back to browser TTS
      speakWithBrowser(text);
      
      // Show a toast notification about the fallback
      if (retryCountRef.current >= maxRetries) {
        toast("Using browser text-to-speech as a fallback");
      }
    }
  }, [voice, isSpeaking, speakWithBrowser, playAudioOptimized]);

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
