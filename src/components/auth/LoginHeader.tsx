
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const LoginHeader = () => {
  return (
    <header className="w-full max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/771d2f6868e34beca92b435a3a406794/396424af1654d8055b71688553dde8eb65b5ae5779a7cf4223c497c74f11c06e"
            alt="Logo"
            className="h-12 w-[188px]"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/771d2f6868e34beca92b435a3a406794/12ddcd33c29d7d2b5686e4eef099b8ec7cc147d087335d00a084533dcefd5801"
            alt="Logo text"
            className="h-6 w-auto"
          />
        </div>
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
