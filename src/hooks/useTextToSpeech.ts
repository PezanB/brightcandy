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
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const currentTextRef = useRef<string | null>(null);
  const processedTextsRef = useRef<Set<string>>(new Set());
  const lastSpeechTimeRef = useRef<number>(0);
  const minTimeBetweenRequests = 150;
  const audioCache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      audioRef.current.onended = () => {
        console.log('Audio playback completed successfully');
        setIsSpeaking(false);
        isProcessingRef.current = false;
        currentTextRef.current = null;
        
        setTimeout(() => {
          if (pendingTextRef.current) {
            const pendingText = pendingTextRef.current;
            pendingTextRef.current = null;
            speak(pendingText);
          }
        }, 50);
      };
      
      audioRef.current.onpause = () => {
        console.log('Audio playback paused');
        setIsSpeaking(false);
      };
      
      audioRef.current.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsSpeaking(false);
        isProcessingRef.current = false;
        currentTextRef.current = null;
        
        if (pendingTextRef.current) {
          const textToSpeak = pendingTextRef.current;
          pendingTextRef.current = null;
          
          setTimeout(() => {
            speakWithBrowser(textToSpeak);
          }, 100);
        }
      };

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
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
          audioSourceRef.current.disconnect();
        } catch (e) {
          console.warn('Error stopping audio source:', e);
        }
        audioSourceRef.current = null;
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
      
      processedTextsRef.current.clear();
      audioCache.current.clear();
    };
  }, []);

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      if (audioCache.current.size > 20) {
        const keys = Array.from(audioCache.current.keys());
        keys.slice(0, keys.length - 20).forEach(key => {
          audioCache.current.delete(key);
        });
      }
      
      processedTextsRef.current.clear();
    }, 2 * 60 * 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    const preloadCommonPhrases = async () => {
      const commonPhrases = [
        "I understand",
        "Let me think about that",
        "That's a good question",
        "Here's what I found"
      ];
      
      for (const phrase of commonPhrases) {
        try {
          const { data, error } = await supabase.functions.invoke('tts', {
            body: { text: phrase, voice }
          });
          
          if (!error && data?.audioContent) {
            audioCache.current.set(phrase, `data:audio/mp3;base64,${data.audioContent}`);
          }
        } catch (e) {
          console.warn(`Failed to preload phrase: ${phrase}`, e);
        }
      }
    };
    
    preloadCommonPhrases();
  }, [voice]);

  const speakWithBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error('Browser does not support speech synthesis');
      return;
    }

    if (currentTextRef.current === text) {
      console.log('Preventing duplicate browser TTS request');
      return;
    }

    console.log('Using browser TTS fallback');
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    currentTextRef.current = text;
    const utterance = new SpeechSynthesisUtterance(text);
    
    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        voices = window.speechSynthesis.getVoices();
        selectVoiceAndSpeak();
      }, { once: true });
    } else {
      selectVoiceAndSpeak();
    }
    
    function selectVoiceAndSpeak() {
      const voicePreferences = [
        (v: SpeechSynthesisVoice) => /Google UK English Female/.test(v.name),
        (v: SpeechSynthesisVoice) => /Google UK English Male/.test(v.name),
        (v: SpeechSynthesisVoice) => /Google US English/.test(v.name),
        
        (v: SpeechSynthesisVoice) => /Microsoft Zira/.test(v.name),
        (v: SpeechSynthesisVoice) => /Microsoft David/.test(v.name),
        
        (v: SpeechSynthesisVoice) => /Samantha/.test(v.name),
        (v: SpeechSynthesisVoice) => /Daniel/.test(v.name),
        
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.localService === false,
        
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
        currentTextRef.current = null;
        
        if (pendingTextRef.current) {
          const pendingText = pendingTextRef.current;
          pendingTextRef.current = null;
          
          setTimeout(() => {
            speak(pendingText);
          }, 50);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        isProcessingRef.current = false;
        currentTextRef.current = null;
      };
      
      if (text.length < 300) {
        window.speechSynthesis.speak(utterance);
        return;
      }
      
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      
      if (sentences.length > 1 && sentences.length < 20) {
        sentences.forEach((sentence, index) => {
          const sentenceUtterance = new SpeechSynthesisUtterance(sentence.trim());
          if (selectedVoice) sentenceUtterance.voice = selectedVoice;
          sentenceUtterance.rate = rate;
          sentenceUtterance.pitch = pitch;
          
          if (index === 0) {
            sentenceUtterance.onstart = utterance.onstart;
          }
          
          if (index === sentences.length - 1) {
            sentenceUtterance.onend = utterance.onend;
            sentenceUtterance.onerror = utterance.onerror;
          }
          
          setTimeout(() => {
            window.speechSynthesis.speak(sentenceUtterance);
          }, index * 25);
        });
      } else {
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [rate, pitch]);

  const playAudioOptimized = useCallback(async (audioSrc: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audioRef.current) {
        reject(new Error('Audio element not initialized'));
        return;
      }

      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
          audioSourceRef.current.disconnect();
        } catch (e) {
          console.warn('Error stopping previous audio:', e);
        }
        audioSourceRef.current = null;
      }

      if (audioContextRef.current && (audioContextRef.current.state === 'running' || audioContextRef.current.state === 'suspended')) {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        try {
          fetch(audioSrc)
            .then(response => {
              const reader = response.body?.getReader();
              if (!reader) {
                throw new Error('Response body reader not available');
              }
              
              return new ReadableStream({
                start(controller) {
                  function push() {
                    reader.read().then(({ done, value }) => {
                      if (done) {
                        controller.close();
                        return;
                      }
                      controller.enqueue(value);
                      push();
                    }).catch(err => {
                      console.error('Stream reading error:', err);
                      controller.error(err);
                    });
                  }
                  push();
                }
              });
            })
            .then(stream => new Response(stream).arrayBuffer())
            .then(arrayBuffer => audioContextRef.current!.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
              const source = audioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              
              const gainNode = audioContextRef.current!.createGain();
              gainNode.gain.value = 1.0;
              
              source.connect(gainNode);
              gainNode.connect(audioContextRef.current!.destination);
              
              audioSourceRef.current = source;
              
              source.onended = () => {
                setIsSpeaking(false);
                isProcessingRef.current = false;
                currentTextRef.current = null;
                resolve();
              };
              
              setIsSpeaking(true);
              source.start(0);
            })
            .catch(error => {
              console.error('Error with AudioContext playback:', error);
              standardPlayback();
            });
        } catch (error) {
          console.error('AudioContext error:', error);
          standardPlayback();
        }
      } else {
        standardPlayback();
      }

      function standardPlayback() {
        audioRef.current!.src = audioSrc;
        audioRef.current!.oncanplaythrough = async () => {
          try {
            audioRef.current!.playbackRate = 1.0;
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

  const speak = useCallback(async (text: string) => {
    if (!text || text.trim() === '') {
      console.log('Empty text provided to speak function, ignoring');
      return;
    }

    const normalizedText = text.trim();
    
    if (currentTextRef.current === normalizedText) {
      console.log('Already speaking this exact text, ignoring duplicate request');
      return;
    }
    
    const now = Date.now();
    if (now - lastSpeechTimeRef.current < minTimeBetweenRequests) {
      console.log('Speech requests coming too quickly, debouncing');
      if (!pendingTextRef.current) {
        pendingTextRef.current = normalizedText;
      }
      return;
    }
    
    lastSpeechTimeRef.current = now;
    
    if (processedTextsRef.current.has(normalizedText)) {
      console.log('Text was already processed recently, preventing loop');
      return;
    }
    
    if (isSpeaking || isProcessingRef.current) {
      console.log('Already speaking or processing, queuing text for later');
      pendingTextRef.current = normalizedText;
      return;
    }

    processedTextsRef.current.add(normalizedText);
    if (processedTextsRef.current.size > 50) {
      const iterator = processedTextsRef.current.values();
      processedTextsRef.current.delete(iterator.next().value);
    }

    isProcessingRef.current = true;
    retryCountRef.current = 0;
    currentTextRef.current = normalizedText;
    
    try {
      if (normalizedText.length < 20) {
        speakWithBrowser(normalizedText);
        return;
      }
      
      if (audioCache.current.has(normalizedText)) {
        console.log('Using cached audio');
        await playAudioOptimized(audioCache.current.get(normalizedText)!);
        return;
      }
      
      const textToProcess = normalizedText.length > 4000 ? normalizedText.substring(0, 4000) : normalizedText;
      
      if (textToProcess.length > 300) {
        const firstSentence = textToProcess.match(/^[^.!?]+[.!?]+/)?.[0] || textToProcess.substring(0, 100);
        
        if (firstSentence && firstSentence.length < textToProcess.length) {
          pendingTextRef.current = textToProcess.substring(firstSentence.length).trim();
          
          const { data: firstData, error: firstError } = await supabase.functions.invoke('tts', {
            body: { text: firstSentence, voice }
          });

          if (firstError) {
            throw new Error(`Supabase TTS error: ${JSON.stringify(firstError)}`);
          }

          if (firstData && firstData.audioContent) {
            const audioSrc = `data:audio/mp3;base64,${firstData.audioContent}`;
            audioCache.current.set(firstSentence, audioSrc);
            await playAudioOptimized(audioSrc);
            return;
          }
        }
      }
      
      const { data, error } = await supabase.functions.invoke('tts', {
        body: { text: textToProcess, voice }
      });

      if (error) {
        console.error(`Supabase TTS error:`, error);
        throw new Error(`Supabase TTS error: ${JSON.stringify(error)}`);
      }

      if (data && data.audioContent) {
        const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
        
        audioCache.current.set(textToProcess, audioSrc);
        
        const loadingTimeout = setTimeout(() => {
          console.warn('Audio loading timeout, falling back to browser TTS');
          speakWithBrowser(normalizedText);
        }, 1500);
        
        try {
          await playAudioOptimized(audioSrc);
          clearTimeout(loadingTimeout);
        } catch (playError) {
          clearTimeout(loadingTimeout);
          console.error('Error playing audio:', playError);
          speakWithBrowser(normalizedText);
        }
      } else {
        throw new Error('No audio data received from Edge Function');
      }
    } catch (error) {
      console.error('Edge Function failed, using browser TTS fallback:', error);
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`Retrying TTS (attempt ${retryCountRef.current} of ${maxRetries})...`);
        
        setTimeout(() => {
          isProcessingRef.current = false;
          speak(normalizedText);
        }, 200);
        return;
      }
      
      speakWithBrowser(normalizedText);
      
      if (retryCountRef.current >= maxRetries) {
        toast("Using browser text-to-speech as a fallback");
      }
    }
  }, [voice, isSpeaking, speakWithBrowser, playAudioOptimized]);

  const stopSpeaking = useCallback(() => {
    pendingTextRef.current = null;
    
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      } catch (e) {
        console.warn('Error stopping audio source:', e);
      }
      audioSourceRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
    isProcessingRef.current = false;
    currentTextRef.current = null;
    
    processedTextsRef.current.clear();
  }, []);

  return { speak, isSpeaking, stopSpeaking };
};
