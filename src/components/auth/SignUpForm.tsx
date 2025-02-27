
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthSignUp } from "@/hooks/useAuthSignUp";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleSignUp, isLoading } = useAuthSignUp();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignUp(email, password);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to create your account
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 mt-8">
        <div className="space-y-4">
          <div>
            <Input
              id="email"
              placeholder="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              data-testid="email-input"
            />
          </div>
          <div>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              data-testid="password-input"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
          data-testid="sign-up-button"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto font-medium" asChild>
            <a href="/" className="text-primary">Sign in</a>
          </Button>
        </div>
      </form>
    </div>
  );
};
