
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginCredentialsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
}

export const LoginCredentials = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading
}: LoginCredentialsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Username</Label>
        <Input
          id="email"
          type="text"
          placeholder="Enter username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
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
          disabled={isLoading}
          data-testid="password-input"
        />
      </div>
    </div>
  );
};
