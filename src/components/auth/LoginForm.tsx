
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
    <div className="w-full max-w-md space-y-8">
      <LoginFormHeader />

      <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="text-center text-xs text-muted-foreground">
        <p>User: admin Password: admin | User: manager Password: manager</p>
        <p>User: rep Password: rep</p>
      </div>
    </div>
  );
};
