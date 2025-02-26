
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export const useAuthLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Map simple usernames to email addresses
      const userEmails: Record<string, string> = {
        'admin': 'admin@brightcandy.com',
        'manager': 'manager@brightcandy.com',
        'rep': 'rep@brightcandy.com'
      };

      const loginEmail = userEmails[username] || username;

      // Validate password length
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      // Attempt to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        toast.error("Invalid username or password");
        setIsLoading(false);
        return;
      }

      // Handle successful login
      if (signInData?.user) {
        sessionStorage.setItem('username', username);
        if (username === 'admin') {
          sessionStorage.setItem("isAdmin", "true");
        }

        // Log the successful login
        await supabase
          .from('logins')
          .insert([{
            user_id: username,
            email: loginEmail,
            success: true,
            user_agent: navigator.userAgent,
          }]);

        toast.success(`Welcome back, ${username}!`);
        navigate("/dashboard");
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
