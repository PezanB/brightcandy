
import React, { useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useConversation } from "@11labs/react";

interface TalkingAvatarProps {
  isSpeaking: boolean;
}

export const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ isSpeaking }) => {
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
  
  // Initialize connection status display
  const connectionStatus = status === "connected" ? "Connected" : "Disconnected";
  
  return (
    <div className="fixed bottom-24 right-8 z-50 transition-all duration-300">
      <div className="relative">
        <Avatar className="h-20 w-20 border-4 border-white shadow-lg overflow-hidden">
          {/* Avatar image */}
          <AvatarImage 
            src="/lovable-uploads/2824b290-03a3-437e-a768-920bf1079b3f.png"
            alt="AI Assistant" 
            className="h-full w-full object-contain"
          />
          
          {/* Add ElevenLabs face animation overlay (shown when speaking) */}
          {isActivelySpeaking && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <div className="mouth-animation w-10 h-6 bg-black rounded-full animate-[pulse_0.3s_ease-in-out_infinite_alternate]" 
                     style={{
                       opacity: 0.2,
                       transform: `scaleY(${Math.random() * 0.6 + 0.4})`,
                     }}
                />
              </div>
            </div>
          )}
        </Avatar>
        
        {/* Speech wave/pulse indicators - only visible when speaking */}
        {isActivelySpeaking && (
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
        
        {/* Connection status indicator (small dot) */}
        <div className="absolute -bottom-1 -right-1">
          <div 
            className={cn(
              "w-3 h-3 rounded-full",
              status === "connected" ? "bg-green-500" : "bg-gray-400"
            )}
            title={connectionStatus}
          ></div>
        </div>
      </div>
    </div>
  );
};
