
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

    // Map predefined users to their proper email format
    const userEmails: Record<string, string> = {
      'admin': 'admin@alphawave.com',
      'manager': 'manager@alphawave.com',
      'rep': 'rep@alphawave.com'
    };

    const loginEmail = userEmails[email] || email;
    const loginSuccess = Object.keys(userEmails).includes(email);

    try {
      if (!loginSuccess) {
        toast.error("Invalid credentials");
        return;
      }

      // Try to sign in first
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password
      });

      // If sign in fails due to no user, create one
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: loginEmail,
          password: password
        });

        if (signUpError) {
          throw signUpError;
        }

        signInData = signUpData;
      } else if (signInError) {
        throw signInError;
      }

      // Record the login attempt
      await supabase
        .from('logins')
        .insert([
          {
            user_id: email,
            email: loginEmail,
            success: loginSuccess,
            user_agent: navigator.userAgent,
          }
        ]);

      // Store the username in sessionStorage for role-based features
      sessionStorage.setItem('username', email);
      
      // Set isAdmin flag if admin user
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
        // Insert the appropriate role based on the username
        let role: Database["public"]["Enums"]["app_role"] = 'rep'; // default role
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
      navigate("/dashboard");

    } catch (error) {
      console.error('Error during login:', error);
      toast.error("An error occurred while logging in");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
