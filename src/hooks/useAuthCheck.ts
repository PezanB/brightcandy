
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthCheck = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          toast("Please login to access the dashboard");
          navigate("/");
          return;
        }

        setUserId(user.id);
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
