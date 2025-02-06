
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, FileSpreadsheet, Calendar, Database, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we'd check the auth state here
    // For now, we'll use a simple check
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";
    if (!isAdmin) {
      navigate("/");
    }
  }, [navigate]);

  const databases = [
    {
      title: "Sales Leads",
      description: "Not synced yet",
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Employee Skills Matrix",
      description: "Not synced yet",
      icon: <FileSpreadsheet className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Employee Roster",
      description: "Not synced yet",
      icon: <Users className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Leave Planner",
      description: "Not synced yet",
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Customer Database",
      description: "Not synced yet",
      icon: <Database className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Customer Usage Analytics",
      description: "Not synced yet",
      icon: <LineChart className="w-6 h-6 text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-muted-foreground mt-2">
            Connect and manage all your data sources in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {databases.map((db, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start gap-4">
                {db.icon}
                <div className="flex-1">
                  <h3 className="font-semibold">{db.title}</h3>
                  <p className="text-sm text-muted-foreground">{db.description}</p>
                </div>
              </div>
              <Button 
                className="w-full mt-4 bg-[#0086C9] hover:bg-[#0086C9]/90"
                onClick={() => {/* Handle connection */}}
              >
                Connect
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
