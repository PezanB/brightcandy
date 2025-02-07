
import { Send, Target, Users, MessageSquare, DollarSign, TrendingUp, ChartBar } from "lucide-react";
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
    setInputMessage(text);
    handleSendMessage(text);
  };

  const managerOptions = [
    {
      text: "Show me optimal opportunity prioritization",
      icon: Target,
      description: "Optimize your sales pipeline with AI-driven prioritization"
    },
    {
      text: "Help with dynamic resource allocation",
      icon: Users,
      description: "Efficiently allocate resources across your sales team"
    },
    {
      text: "Show data-driven engagement strategies",
      icon: ChartBar,
      description: "Leverage data insights for better customer engagement"
    },
    {
      text: "Suggest upsells and cross-sells",
      icon: TrendingUp,
      description: "Identify revenue opportunities in your customer base"
    },
    {
      text: "Help with personalized messaging",
      icon: MessageSquare,
      description: "Create tailored messages for different customer segments"
    },
    {
      text: "Create sales collateral",
      icon: DollarSign,
      description: "Generate effective sales materials and presentations"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <img
            src="/lovable-uploads/5cc17fd4-a9e4-479d-a276-95baf79bea04.png"
            alt="Assistant"
            className="w-16 h-16 mx-auto"
          />
          <h1 className="text-2xl font-semibold">How can I help you today?</h1>
          <p className="text-muted-foreground">
            Empowering sales teams with generative AI and advanced modeling for data-driven decisions
          </p>
        </div>
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Chat with NovaEdge"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              size="icon"
              className="bg-[#0086C9] hover:bg-[#0086C9]/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isManager && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {managerOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleActionClick(option.text)}
                  className="flex gap-2 items-center justify-start h-auto p-4 text-left"
                >
                  <option.icon className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{option.text}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
