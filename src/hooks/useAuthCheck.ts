
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await authService.getUser();
        
        if (!user) {
          toast("Please login to access the dashboard");
          navigate("/");
          return;
        }

        setUserId(user.email);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  return { userId, isLoading };
};
