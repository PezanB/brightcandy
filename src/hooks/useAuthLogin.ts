
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

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });

      // If sign in fails, try to create the account
      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: loginEmail,
          password
        });

        if (signUpError) {
          toast.error("Failed to create account. Please try again.");
          console.error("Signup error:", signUpError);
          setIsLoading(false);
          return;
        }

        if (signUpData?.user) {
          // Set user role based on username
          let role: Database["public"]["Enums"]["app_role"] = 'rep';
          if (username === 'admin') role = 'admin';
          if (username === 'manager') role = 'manager';

          // Insert user role
          await supabase
            .from('user_roles')
            .insert({
              user_id: username,
              role: role
            });

          sessionStorage.setItem('username', username);
          if (username === 'admin') {
            sessionStorage.setItem("isAdmin", "true");
          }

          toast.success("Account created successfully!");
          navigate("/dashboard");
        }
      } else if (signInData?.user) {
        // Successful login
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
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
