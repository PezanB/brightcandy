
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export const useAuthLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { user, error } = await authService.login(username, password);

      if (error) {
        throw error;
      }

      if (user) {
        toast.success(`Welcome back!`);
        navigate("/dashboard");
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
