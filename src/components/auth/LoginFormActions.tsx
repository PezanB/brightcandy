
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormActionsProps {
  isLoading: boolean;
  rememberMe: boolean;
  setRememberMe: (checked: boolean) => void;
}

export const LoginFormActions = ({
  isLoading,
  rememberMe,
  setRememberMe
}: LoginFormActionsProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            disabled={isLoading}
            data-testid="remember-checkbox"
          />
          <label
            htmlFor="remember"
            className="text-sm text-muted-foreground"
          >
            Remember for 30 days
          </label>
        </div>
        <Button variant="link" className="text-sm font-medium p-0 h-auto" asChild>
          <a href="/forgot-password" className="text-primary">Forgot password</a>
        </Button>
      </div>

      <div className="space-y-4">
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
          data-testid="sign-in-button"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          disabled={isLoading}
          data-testid="sso-button"
        >
          <img src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg" alt="Google" className="w-4 h-4" />
          Sign in with Google
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Button variant="link" className="p-0 h-auto font-medium" asChild>
          <a href="/signup" className="text-primary">Sign up</a>
        </Button>
      </div>
    </>
  );
};
