
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
          disabled={isLoading}
          data-testid="sign-in-button"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          disabled={isLoading}
          data-testid="sso-button"
        >
          Continue with SAML SSO
        </Button>
      </div>
    </>
  );
};
