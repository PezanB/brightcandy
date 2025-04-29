
import { useState, useEffect } from "react";
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
        // For our hardcoded admin user, we'll assign a default admin role
        if (username === 'admin@brightcandy.ai') {
          setUserRole('admin');
          console.log('User role set to: admin');
        } else {
          setUserRole('user');
          console.log('User role set to: user');
        }
      } catch (error) {
        console.error('Error determining user role:', error);
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
