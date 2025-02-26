
import { Link } from "react-router-dom";
import { Search, Settings, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1">
              <img
                src="/lovable-uploads/07539f35-f375-47f3-919c-7c6ab5bc47cc.png"
                alt="Logo"
                className="h-8 w-auto"
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Link to="/dashboard" className="text-sm font-medium bg-secondary text-white px-3 py-2 rounded-md">
                Dashboard
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Projects
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Tasks
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Reporting
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Users
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/lovable-uploads/b67eae23-4b47-4419-951a-1f87a4e7eb5f.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};
