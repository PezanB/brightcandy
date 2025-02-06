
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Dashboard = () => {
  const navigate = useNavigate();
  const [hasMessages, setHasMessages] = useState(false);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-[calc(100vh-64px)]">
        {hasMessages ? (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={30}>
              <Chat onMessageSent={() => setHasMessages(true)} hasMessages={hasMessages} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={70} minSize={30}>
              <ResultsPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <Chat onMessageSent={() => setHasMessages(true)} hasMessages={hasMessages} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
