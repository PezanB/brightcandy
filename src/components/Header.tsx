
import { Link, useLocation } from "react-router-dom";
import { Search, Settings, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/lovable-uploads/6b555345-601e-40f1-bf5e-e9298a0149d4.png"
                alt="Logo"
                className="h-10 w-auto"
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`text-base font-medium ${
                  isActive('/') 
                    ? 'text-[#F97316] hover:text-[#F97316]/90' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              <Link 
                to="#" 
                className={`text-base font-medium ${
                  isActive('/chat') 
                    ? 'text-[#F97316] hover:text-[#F97316]/90' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chat
              </Link>
              <Link 
                to="/dashboard" 
                className={`text-base font-medium ${
                  isActive('/dashboard') 
                    ? 'text-[#F97316] hover:text-[#F97316]/90' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <Search className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <Settings className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <Bell className="h-6 w-6" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/lovable-uploads/b67eae23-4b47-4419-951a-1f87a4e7eb5f.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

