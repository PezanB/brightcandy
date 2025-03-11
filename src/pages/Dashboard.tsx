
import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useElevenLabsSetup } from "@/hooks/useElevenLabsSetup";
import { AvatarSettings } from "@/components/dashboard/AvatarSettings";

// Avatar position type for better type safety
type AvatarPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'custom';

interface CustomPosition {
  bottom?: string;
  left?: string;
  right?: string;
  top?: string;
}

const Dashboard = () => {
  const { userId, isLoading } = useAuthCheck();
  const { apiKeyFetched } = useElevenLabsSetup(userId);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);
  
  // Update initial position to bottom-right
  const [avatarPosition, setAvatarPosition] = useState<AvatarPosition>('bottom-right');
  const [avatarCustomPosition, setAvatarCustomPosition] = useState<CustomPosition>({
    bottom: '20px',
    right: '20px'
  });

  const toggleAutoSpeak = () => {
    setAutoSpeakEnabled(prev => !prev);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(100vh-64px)] relative">
        <div className="absolute top-4 right-4 z-10">
          <AvatarSettings 
            position={avatarPosition}
            customPosition={avatarCustomPosition}
            onPositionChange={setAvatarPosition}
            onCustomPositionChange={setAvatarCustomPosition}
          />
        </div>
        <DashboardContent 
          autoSpeakEnabled={autoSpeakEnabled}
          onToggleAutoSpeak={toggleAutoSpeak}
          avatarPosition={avatarPosition}
          avatarCustomPosition={avatarCustomPosition}
        />
      </div>
    </div>
  );
};

export default Dashboard;
