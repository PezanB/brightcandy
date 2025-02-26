
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EmptyStateProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (message?: string) => void;
  handleUpload: () => void;
  handleLinkData: () => void;
}

export const EmptyState = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
}: EmptyStateProps) => {
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const username = sessionStorage.getItem('username');
      if (username) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', username)
          .maybeSingle();
        
        setIsManager(data?.role === 'manager');
        
        if (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };
    
    checkUserRole();
  }, []);

  const handleActionClick = (text: string) => {
    handleSendMessage(text);
  };

  const actionButtons = [
    { text: "Sales Data Insights", icon: "📊" },
    { text: "Sales Data Diagnostics", icon: "🔍" },
    { text: "Sales Performance Projections", icon: "📈" },
    { text: "Sales Optimization Solutions", icon: "⚙️" },
    { text: "Adapt & Optimize", icon: "🔄" }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">How can I help you today?</h1>
          <p className="text-gray-600">
            Empowering sales teams with generative AI and advanced modeling for data-driven decisions
          </p>
        </div>
        <div className="max-w-2xl mx-auto w-full space-y-6">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <img
                  src="/lovable-uploads/5cc17fd4-a9e4-479d-a276-95baf79bea04.png"
                  alt="Assistant"
                  className="h-5 w-5"
                />
              </div>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Chat with BrightCandy"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="pl-10 border-gray-200"
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              className="bg-[#00BFA6] hover:bg-[#00BFA6]/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {actionButtons.map((button, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleActionClick(button.text)}
                className="text-gray-700 border-gray-200 hover:bg-gray-50"
              >
                <span className="mr-2">{button.icon}</span>
                {button.text}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => handleActionClick("Creative Strategies")}
              className="text-gray-700 border-gray-200 hover:bg-gray-50"
            >
              <span className="mr-2">💡</span>
              Creative Strategies
            </Button>
            <Button
              variant="outline"
              onClick={() => handleActionClick("Sustainable Eco-system")}
              className="text-gray-700 border-gray-200 hover:bg-gray-50"
            >
              <span className="mr-2">🌱</span>
              Sustainable Eco-system
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
