
import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TalkingAvatarProps {
  isSpeaking: boolean;
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ isSpeaking }) => {
  const [mouthSize, setMouthSize] = useState(1);
  
  // Enhanced animation logic for more natural speaking effect
  useEffect(() => {
    if (isSpeaking) {
      // Create more dynamic mouth movement for talking animation
      const interval = setInterval(() => {
        // Random mouth movements to simulate speaking
        const randomSize = 0.8 + Math.random() * 0.4; // Values between 0.8 and 1.2
        setMouthSize(randomSize);
      }, 150); // Faster interval for more dynamic movement

      return () => clearInterval(interval);
    } else {
      // Reset mouth when not speaking
      setMouthSize(1);
    }
  }, [isSpeaking]);

  return (
    <div className="fixed bottom-24 right-8 z-50 transition-all duration-300">
      <div className="relative">
        <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
          <AvatarImage 
            src="/lovable-uploads/2824b290-03a3-437e-a768-920bf1079b3f.png"
            alt="AI Assistant" 
            className="h-full w-full object-contain"
            style={{
              transform: `scale(${mouthSize})`,
              transition: 'transform 0.15s ease-in-out'
            }}
          />
        </Avatar>
        
        {/* Speech indicator - only visible when speaking */}
        {isSpeaking && (
          <>
            <div className={cn(
              "absolute inset-0 rounded-full border-4 border-[#36B9D3]/20",
              "animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"
            )}></div>
            <div className={cn(
              "absolute inset-[-8px] rounded-full border-4 border-[#36B9D3]/10",
              "animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.3s]"
            )}></div>
            <div className={cn(
              "absolute inset-[-16px] rounded-full border-4 border-[#36B9D3]/5",
              "animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.6s]"
            )}></div>
            
            {/* Sound wave animation */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2">
              <div className="flex items-center gap-[3px]">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={cn(
                      "bg-[#36B9D3] w-1 rounded-full animate-[scale-in_0.5s_ease-in-out_infinite_alternate]"
                    )}
                    style={{
                      height: `${8 + Math.random() * 10}px`,
                      animationDuration: `${0.7 + Math.random() * 0.3}s`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
