
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  // Cleanup function to handle audio element
  useEffect(() => {
    // Create a single audio element to reuse
    audioRef.current = new Audio();
    
    // Set up event listeners
    if (audioRef.current) {
      audioRef.current.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
      };
      
      audioRef.current.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
      };
    }
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
      }
    };
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
      // If already speaking, cancel to avoid overlap
      if (isSpeaking) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        window.speechSynthesis.cancel();
      }

      setIsSpeaking(true);

      if (!text || text.trim().length === 0) {
        setIsSpeaking(false);
        return;
      }
      
      console.log("Starting text-to-speech for:", text.substring(0, 50) + "...");

      // Try using the Supabase edge function first
      try {
        console.log("Attempting to use Supabase TTS function");
        const { data, error } = await supabase.functions.invoke('text-to-voice', {
          body: {
            text,
            voice: 'nova' // Using OpenAI's more natural-sounding voice
          }
        });

        if (error) {
          console.error("Supabase TTS error:", error);
          throw error;
        }

        console.log("Received audio data from Supabase, playing...");
        
        // Convert base64 to audio and play
        if (audioRef.current) {
          // Remove any previous event listeners to prevent memory leaks
          audioRef.current.onended = null;
          audioRef.current.onerror = null;
          
          // Set up new event listeners
          audioRef.current.onended = () => {
            console.log("Audio playback completed");
            setIsSpeaking(false);
          };
          
          audioRef.current.onerror = (e) => {
            console.error("Audio playback error:", e);
            setIsSpeaking(false);
            throw new Error("Audio playback failed");
          };
          
          // Set the audio source and play
          audioRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
          
          // Use a promise to ensure we wait for audio to load before playing
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playback started successfully");
              })
              .catch(error => {
                console.error("Audio playback promise failed:", error);
                setIsSpeaking(false);
                throw error;
              });
          }
        }
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
            console.log("Browser TTS playback completed");
            setIsSpeaking(false);
          };
          
          utterance.onerror = (event) => {
            console.error("Browser TTS error:", event);
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
  }, [voices, toast, isSpeaking]);

  return { speak, isSpeaking };
};
