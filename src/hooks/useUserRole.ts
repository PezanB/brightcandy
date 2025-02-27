
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      const username = sessionStorage.getItem('username');
      if (!username) {
        console.log('No username found in session storage');
        return;
      }

      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', username)
          .maybeSingle();

        if (roleError) throw roleError;
        if (roleData) {
          setUserRole(roleData.role);
          console.log('User role set to:', roleData.role);
        } else {
          console.log('No role found for user:', username);
          setUserRole('default');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        toast({
          title: "Error",
          description: "Failed to fetch user role. Using default AI assistant.",
          variant: "destructive",
        });
        setUserRole('default');
      }
    };

    fetchUserRole();
  }, [toast]);

  return userRole;
};
