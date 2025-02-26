
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useAuthLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simple validation for username
      if (!['admin', 'manager', 'rep'].includes(username)) {
        toast.error("Invalid username. Please use 'admin', 'manager', or 'rep'");
        setIsLoading(false);
        return;
      }

      // Simple password check - using "password123" for all roles
      if (password !== 'password123') {
        toast.error("Invalid password");
        setIsLoading(false);
        return;
      }

      // Store role information in session
      sessionStorage.setItem('username', username);
      if (username === 'admin') {
        sessionStorage.setItem("isAdmin", "true");
      }

      toast.success(`Welcome back, ${username}!`);
      navigate("/dashboard");

    } catch (error) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
