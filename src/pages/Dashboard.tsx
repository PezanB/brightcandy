
import { useState } from "react";
import { Header } from "@/components/Header";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useElevenLabsSetup } from "@/hooks/useElevenLabsSetup";

const Dashboard = () => {
  const { userId, isLoading } = useAuthCheck();
  const { apiKeyFetched } = useElevenLabsSetup(userId);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false);

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
        />
      </div>
    </div>
  );
};

export default Dashboard;
