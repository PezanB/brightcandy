
import { Send, BarChart2, Search, TrendingUp, Settings, Lightbulb, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmptyStateProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (message?: string) => void;
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLinkData: () => void;
}

export const EmptyState = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
}: EmptyStateProps) => {
  const quickActions = [
    { text: "Sales Data Insights", icon: <BarChart2 className="h-4 w-4" /> },
    { text: "Sales Data Diagnostics", icon: <Search className="h-4 w-4" /> },
    { text: "Sales Performance Projections", icon: <TrendingUp className="h-4 w-4" /> },
    { text: "Sales Optimization Solutions", icon: <Settings className="h-4 w-4" /> },
    { text: "Creative Strategies", icon: <Lightbulb className="h-4 w-4" /> },
    { text: "Sustainable Eco-system", icon: <Leaf className="h-4 w-4" /> },
  ];

  const handleQuickActionClick = (text: string) => {
    // Instead of modifying state then sending, we'll directly call handleSendMessage
    // with the action text, bypassing the input field state entirely
    handleSendMessage(text);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-800">
            How can I help you today?
          </h1>
          <p className="text-lg text-gray-600">
            Empowering sales teams with generative AI and advanced modeling for data-driven decisions
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Chat with BrightCandy"
              className="w-full pr-12 h-[52px] text-base rounded-xl"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </div>
          <Button
            onClick={() => handleSendMessage()}
            size="lg"
            className="bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity px-8 h-[52px] rounded-xl"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto py-3 px-4 bg-gradient-to-r from-[#2691A4] to-[#36B9D3] text-white hover:opacity-90 transition-opacity rounded-xl whitespace-normal text-left"
              onClick={() => handleQuickActionClick(action.text)}
            >
              {action.icon}
              <span className="ml-2 line-clamp-2">{action.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
