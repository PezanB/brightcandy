
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, FileSpreadsheet, Calendar, Database, LineChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [syncStates, setSyncStates] = useState<{ [key: string]: boolean }>({});

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
      icon: <BarChart3 className="w-8 h-8 text-black" />,
    },
    {
      title: "Employee Skills Matrix",
      description: "Not synced yet",
      icon: <FileSpreadsheet className="w-8 h-8 text-black" />,
    },
    {
      title: "Employee Roster",
      description: "Not synced yet",
      icon: <Users className="w-8 h-8 text-black" />,
    },
    {
      title: "Leave Planner",
      description: "Not synced yet",
      icon: <Calendar className="w-8 h-8 text-black" />,
    },
    {
      title: "Customer Database",
      description: "Not synced yet",
      icon: <Database className="w-8 h-8 text-black" />,
    },
    {
      title: "Customer Usage Analytics",
      description: "Not synced yet",
      icon: <LineChart className="w-8 h-8 text-black" />,
    },
  ];

  const handleSync = (index: number, title: string) => {
    // Toggle sync state for this database
    setSyncStates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));

    // Show success toast
    toast({
      title: "Success!",
      description: syncStates[index] 
        ? `${title} connection updated successfully`
        : `${title} connected successfully`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-muted-foreground mt-2">
            Connect and manage all your data sources in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {databases.map((db, index) => (
            <Card key={index} className="p-16 rounded-2xl shadow-lg hover:shadow-xl transition-all flex flex-col">
              <div className="flex items-start gap-4 flex-1">
                {db.icon}
                <div>
                  <h3 className="text-xl font-semibold">{db.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{db.description}</p>
                </div>
              </div>
              <Button 
                className="w-full mt-12 bg-[#0086C9] hover:bg-[#0086C9]/90"
                onClick={() => handleSync(index, db.title)}
              >
                {syncStates[index] ? "Sync Now" : "Connect"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
