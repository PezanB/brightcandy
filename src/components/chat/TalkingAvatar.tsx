
import React, { useEffect, useState, useRef } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useConversation } from "@11labs/react";

interface TalkingAvatarProps {
  isSpeaking: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'custom';
  customPosition?: {
    bottom?: string;
    left?: string;
    right?: string;
    top?: string;
  };
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ 
  isSpeaking, 
  position = 'bottom-left',
  customPosition
}) => {
  // State for animating different mouth shapes
  const [mouthShape, setMouthShape] = useState<number>(0);
  const animationTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize ElevenLabs conversation hook
  const { status, isSpeaking: elevenlabsSpeaking } = useConversation({
    overrides: {
      tts: {
        voiceId: "EXAVITQu4vr4xnSDxMaL" // Sarah voice
      }
    }
  });

  // Combine the isSpeaking prop with ElevenLabs isSpeaking state
  // This ensures we show animation both when our app thinks it's speaking
  // and when ElevenLabs is actually producing speech
  const isActivelySpeaking = isSpeaking || elevenlabsSpeaking;
  
  // Create realistic mouth animations when speaking
  useEffect(() => {
    if (isActivelySpeaking) {
      // Clear any existing animation
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
      }
      
      // Create a more realistic speaking animation by cycling through different mouth shapes
      animationTimer.current = setInterval(() => {
        setMouthShape(prev => {
          // Randomly choose between 5 different mouth positions to simulate natural speech
          const newShape = Math.floor(Math.random() * 5);
          return newShape;
        });
      }, 120); // Update at a natural speaking pace
    } else {
      // Stop the animation when not speaking
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
        animationTimer.current = null;
      }
      // Reset to closed mouth
      setMouthShape(0);
    }
    
    return () => {
      if (animationTimer.current) {
        clearInterval(animationTimer.current);
        animationTimer.current = null;
      }
    };
  }, [isActivelySpeaking]);
  
  // Initialize connection status display
  const connectionStatus = status === "connected" ? "Connected" : "Disconnected";
  
  // Get mouth animation properties based on current shape
  const getMouthStyle = () => {
    // Different mouth shapes for more realistic animation
    const shapes = [
      { height: '0.6rem', opacity: 0.05, borderRadius: '40%' }, // Closed/rest
      { height: '1.5rem', opacity: 0.25, borderRadius: '45%' }, // Slightly open
      { height: '2.4rem', opacity: 0.3, borderRadius: '50%' },  // Medium open
      { height: '3rem', opacity: 0.35, borderRadius: '40%' },   // Wide open
      { height: '1.8rem', opacity: 0.28, borderRadius: '30%' }  // Different shape
    ];
    
    return shapes[mouthShape];
  };

  // Determine position classes based on props
  const getPositionClasses = () => {
    if (position === 'custom' && customPosition) {
      return "fixed z-50 transition-all duration-300";
    }

    const positionClasses = {
      'bottom-left': 'fixed bottom-6 left-6 z-50 transition-all duration-300',
      'bottom-right': 'fixed bottom-6 right-6 z-50 transition-all duration-300',
      'top-left': 'fixed top-6 left-6 z-50 transition-all duration-300',
      'top-right': 'fixed top-6 right-6 z-50 transition-all duration-300',
    };

    return positionClasses[position];
  };

  // Determine custom style if using custom position
  const getCustomStyle = () => {
    if (position === 'custom' && customPosition) {
      return customPosition;
    }
    return {};
  };
  
  return (
    <div className={getPositionClasses()} style={getCustomStyle()}>
      <div className="relative">
        <Avatar className="h-20 w-20 border-2 border-white shadow-lg overflow-hidden">
          {/* Avatar image */}
          <AvatarImage 
            src="/lovable-uploads/2824b290-03a3-437e-a768-920bf1079b3f.png"
            alt="AI Assistant" 
            className="h-full w-full object-contain"
          />
          
          {/* Realistic mouth animation overlay */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            isActivelySpeaking ? "opacity-100" : "opacity-0"
          )}>
            <div className="w-full h-full flex items-center justify-center">
              <div 
                className="mouth-animation bg-black rounded-full transition-all duration-75"
                style={{
                  width: '35%',
                  ...getMouthStyle(),
                  transform: `translateY(${mouthShape * 0.16 + 1}rem)`
                }}
              />
            </div>
          </div>
        </Avatar>
        
        {/* Speech wave/pulse indicators - only visible when speaking */}
        {isActivelySpeaking && (
          <>
            <div className={cn(
              "absolute inset-0 rounded-full border-2 border-[#36B9D3]/20",
              "animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            )}></div>
            <div className={cn(
              "absolute inset-[-5px] rounded-full border-2 border-[#36B9D3]/10",
              "animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.3s]"
            )}></div>
            <div className={cn(
              "absolute inset-[-10px] rounded-full border-2 border-[#36B9D3]/5",
              "animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.6s]"
            )}></div>
            
            {/* Sound wave animation */}
            <div className="absolute -right-7 top-1/2 -translate-y-1/2">
              <div className="flex items-center gap-[3px]">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={cn(
                      "bg-[#36B9D3] w-1.25 rounded-full animate-[scale-in_0.5s_ease-in-out_infinite_alternate]"
                    )}
                    style={{
                      height: `${10 + Math.random() * 12}px`,
                      animationDuration: `${0.7 + Math.random() * 0.3}s`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Connection status indicator (small dot) */}
        <div className="absolute -bottom-1 -right-1">
          <div 
            className={cn(
              "w-4 h-4 rounded-full",
              status === "connected" ? "bg-green-500" : "bg-green-300"
            )}
            title={connectionStatus}
          ></div>
        </div>
      </div>
    </div>
  );
};
