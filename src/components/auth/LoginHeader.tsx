
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const LoginHeader = () => {
  return (
    <header className="w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-1">
          <img
            src="/lovable-uploads/8417b51d-5855-4eac-ba70-7cf0dfc6b69f.png"
            alt="AlphaWave Logo"
            className="h-12"
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
