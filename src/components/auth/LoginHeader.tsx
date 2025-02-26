
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const LoginHeader = () => {
  return (
    <header className="w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-1">
          <img
            src="/lovable-uploads/07539f35-f375-47f3-919c-7c6ab5bc47cc.png"
            alt="Logo"
            className="h-12 w-auto"
          />
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Don't have an account?
          </span>
          <Button variant="link" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
