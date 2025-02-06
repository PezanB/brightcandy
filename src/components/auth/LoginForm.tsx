import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple admin check - in a real app, this would be handled by proper authentication
    if (email === "admin" && password === "admin") {
      sessionStorage.setItem("isAdmin", "true");
      toast.success("Logged in as admin");
      navigate("/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Log in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Please enter your details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="email-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="password-input"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              data-testid="remember-checkbox"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember for 30 days
            </label>
          </div>
          <Button variant="link" className="text-sm" asChild>
            <a href="/forgot-password">Forgot password</a>
          </Button>
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-[#0086C9] hover:bg-[#0086C9]/90"
            data-testid="sign-in-button"
          >
            Sign in
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            data-testid="sso-button"
          >
            Continue with SAML SSO
          </Button>
        </div>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        <p>User: admin Password: admin | User: manager Password: manager</p>
        <p>User: rep Password: rep</p>
      </div>
    </div>
  );
};
