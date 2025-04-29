
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export const useAuthSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { user, error } = await authService.signUp(email, password);

      if (error) {
        throw error;
      }

      if (user) {
        toast.success("Account created successfully! You can now log in.");
        navigate("/");
      }

    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSignUp, isLoading };
};
