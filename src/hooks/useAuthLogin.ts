
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
      'admin': 'admin@brightcandy.com',
      'manager': 'manager@brightcandy.com',
      'rep': 'rep@brightcandy.com'
    };

    const loginEmail = userEmails[email] || email;

    try {
      // Validate password length
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }

      // Try to sign in first
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password
      });

      // If sign in fails due to invalid credentials, try to create the account
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log('Creating new account for:', loginEmail);
        
        // Try to create a new account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: loginEmail,
          password: password,
          options: {
            data: {
              role: email // Store the original role (admin/manager/rep)
            }
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          toast.error(signUpError.message);
          setIsLoading(false);
          return;
        }

        // If signup successful, try signing in again
        if (signUpData?.user) {
          const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: password
          });

          if (newSignInError) {
            console.error('New sign in error:', newSignInError);
            toast.error("Account created but login failed. Please try again.");
            setIsLoading(false);
            return;
          }

          signInData = newSignInData;
        }
      } else if (signInError) {
        console.error('Sign in error:', signInError);
        toast.error("Invalid credentials");
        setIsLoading(false);
        return;
      }

      // Only proceed if we have valid sign in data
      if (!signInData?.user) {
        toast.error("Something went wrong during authentication");
        setIsLoading(false);
        return;
      }

      // Record the login attempt
      await supabase
        .from('logins')
        .insert([
          {
            user_id: email,
            email: loginEmail,
            success: true,
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
      
      console.log('Login successful for:', email);
      toast.success(`Logged in as ${email}`);
      
      // Make sure we reset loading state before navigation
      setIsLoading(false);
      
      // Use navigate to redirect to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error('Error during login:', error);
      toast.error("An error occurred while logging in");
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
