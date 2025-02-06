
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Chat } from "@/components/Chat";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Chat />
    </div>
  );
};

export default Dashboard;
