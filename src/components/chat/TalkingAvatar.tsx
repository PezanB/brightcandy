
import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TalkingAvatarProps {
  isSpeaking: boolean;
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ isSpeaking }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pulseSize, setPulseSize] = useState(1);

  // Animation logic
  useEffect(() => {
    if (isSpeaking) {
      setIsVisible(true);
      
      // Create pulsing effect for talking animation
      const interval = setInterval(() => {
        setPulseSize((prev) => (prev === 1 ? 1.1 : 1));
      }, 350);

      return () => clearInterval(interval);
    } else {
      // Hide with a small delay when stopped speaking
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isSpeaking]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-32 right-8 z-50 transition-all duration-300",
      isSpeaking ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
    )}>
      <div className="relative">
        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
          <AvatarImage 
            src="/lovable-uploads/f2bbc74a-0c34-4460-b5e4-5a3acb885e81.png"
            alt="BrightCandy AI" 
            className="h-full w-full object-contain"
            style={{
              transform: `scale(${pulseSize})`,
              transition: 'transform 0.35s ease-in-out'
            }}
          />
        </Avatar>
        
        {/* Speech indicator pulse rings */}
        <div className={cn(
          "absolute inset-0 rounded-full border-4 border-[#36B9D3]/10",
          "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
        )}></div>
        <div className={cn(
          "absolute inset-[-10px] rounded-full border-4 border-[#36B9D3]/5",
          "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite_0.5s]"
        )}></div>
      </div>
    </div>
  );
};
