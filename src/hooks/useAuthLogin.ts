
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export const useAuthLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Map predefined users to their proper email format
      const userEmails: Record<string, string> = {
        'admin': 'admin@brightcandy.com',
        'manager': 'manager@brightcandy.com',
        'rep': 'rep@brightcandy.com'
      };

      const loginEmail = userEmails[email] || email;

      // Validate password length
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      // Always try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password
      });

      if (signInError) {
        // If the user doesn't exist, create a new account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: loginEmail,
          password: password
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          toast.error(signUpError.message);
        } else if (signUpData?.user) {
          // New user successfully created
          let role: Database["public"]["Enums"]["app_role"] = 'rep';
          if (email === 'admin') role = 'admin';
          if (email === 'manager') role = 'manager';

          await supabase
            .from('user_roles')
            .insert({
              user_id: email,
              role: role
            });

          sessionStorage.setItem('username', email);
          
          if (email === 'admin') {
            sessionStorage.setItem("isAdmin", "true");
          }

          toast.success("Account created and logged in");
          setIsLoading(false);
          navigate("/dashboard");
          return;
        }
        setIsLoading(false);
        return;
      }

      // Successfully signed in
      if (signInData?.user) {
        await supabase
          .from('logins')
          .insert([{
            user_id: email,
            email: loginEmail,
            success: true,
            user_agent: navigator.userAgent,
          }]);

        sessionStorage.setItem('username', email);
        
        if (email === 'admin') {
          sessionStorage.setItem("isAdmin", "true");
        }

        // Check if this is first login for the user and insert role if needed
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', email)
          .maybeSingle();

        if (!existingRole) {
          let role: Database["public"]["Enums"]["app_role"] = 'rep';
          if (email === 'admin') role = 'admin';
          if (email === 'manager') role = 'manager';

          await supabase
            .from('user_roles')
            .insert({
              user_id: email,
              role: role
            });
        }

        toast.success(`Logged in as ${email}`);
        setIsLoading(false);
        navigate("/dashboard");
        return;
      }

      // If we reach here, something unexpected happened
      toast.error("An error occurred while logging in");
      setIsLoading(false);

    } catch (error) {
      console.error('Error during login:', error);
      toast.error("An error occurred while logging in");
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
