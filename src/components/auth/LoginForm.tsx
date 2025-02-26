
import { useState } from "react";
import { LoginFormHeader } from "./LoginFormHeader";
import { LoginCredentials } from "./LoginCredentials";
import { LoginFormActions } from "./LoginFormActions";
import { useAuthLogin } from "@/hooks/useAuthLogin";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { handleLogin, isLoading } = useAuthLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <LoginFormHeader />

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <LoginCredentials
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLoading={isLoading}
        />

        <LoginFormActions
          isLoading={isLoading}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
        />
      </form>

      <div className="text-center text-xs text-muted-foreground mt-8">
        <p className="font-medium mb-1">Test Credentials:</p>
        <p>Username: "admin", "manager", or "rep"</p>
        <p>Password: password123</p>
      </div>
    </div>
  );
};
