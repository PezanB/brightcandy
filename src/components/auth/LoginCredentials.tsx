
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
        <Label htmlFor="email" className="text-content">Username</Label>
        <Input
          id="email"
          type="text"
          placeholder="Enter your username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          data-testid="email-input"
          className="placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-content">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          data-testid="password-input"
          className="placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};
