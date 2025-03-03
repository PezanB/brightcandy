
import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useElevenLabsSetup } from "@/hooks/useElevenLabsSetup";

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
  
  // Avatar positioning state
  const [avatarPosition, setAvatarPosition] = useState<AvatarPosition>('bottom-left');
  const [avatarCustomPosition, setAvatarCustomPosition] = useState<CustomPosition>({
    bottom: '20px',
    left: '20px'
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
      <div className="h-[calc(100vh-64px)]">
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
