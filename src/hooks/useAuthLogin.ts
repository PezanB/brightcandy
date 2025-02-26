
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
      // Map simple usernames to email addresses and passwords
      const userCredentials: Record<string, { email: string, password: string }> = {
        'admin': { email: 'admin@brightcandy.com', password: 'admin123' },
        'manager': { email: 'manager@brightcandy.com', password: 'manager123' },
        'rep': { email: 'rep@brightcandy.com', password: 'rep123' }
      };

      const credentials = userCredentials[username];
      if (!credentials) {
        toast.error("Invalid username");
        setIsLoading(false);
        return;
      }

      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      // If sign in fails due to invalid credentials, try to create the account
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('Creating new account for:', credentials.email);
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          toast.error("Failed to create account");
          setIsLoading(false);
          return;
        }

        if (signUpData?.user) {
          // Set user role based on username
          let role: Database["public"]["Enums"]["app_role"] = 'rep';
          if (username === 'admin') role = 'admin';
          if (username === 'manager') role = 'manager';

          // Insert user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: signUpData.user.id,
              role: role
            });

          if (roleError) {
            console.error('Role assignment error:', roleError);
            toast.error("Failed to assign user role");
            setIsLoading(false);
            return;
          }

          // Store session data
          sessionStorage.setItem('username', username);
          if (username === 'admin') {
            sessionStorage.setItem("isAdmin", "true");
          }

          // Log the successful account creation
          await supabase
            .from('logins')
            .insert([{
              user_id: username,
              email: credentials.email,
              success: true,
              user_agent: navigator.userAgent,
            }]);

          toast.success("Account created and logged in successfully!");
          navigate("/dashboard");
          return;
        }
      } else if (signInError) {
        console.error('Sign in error:', signInError);
        toast.error("An error occurred during login");
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
            email: credentials.email,
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
