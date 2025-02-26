
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

      // First check if user exists by trying to sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email: loginEmail,
        password: password,
        options: {
          data: {
            role: email
          }
        }
      });

      // If we get "User already registered", try to sign in
      if (signUpError?.message?.includes('User already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: password
        });

        if (signInError) {
          console.error('Login failed:', signInError);
          toast.error("Invalid password");
          setIsLoading(false);
          return;
        }

        if (!signInData?.user) {
          toast.error("Something went wrong during authentication");
          setIsLoading(false);
          return;
        }

        // Successfully signed in
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

        console.log('Login successful for:', email);
        toast.success(`Logged in as ${email}`);
        
        setIsLoading(false);
        navigate("/dashboard");
      } else if (!signUpError) {
        // New user successfully created
        toast.success("Account created and logged in");
        sessionStorage.setItem('username', email);
        
        if (email === 'admin') {
          sessionStorage.setItem("isAdmin", "true");
        }

        // Insert role for new user
        let role: Database["public"]["Enums"]["app_role"] = 'rep';
        if (email === 'admin') role = 'admin';
        if (email === 'manager') role = 'manager';

        await supabase
          .from('user_roles')
          .insert({
            user_id: email,
            role: role
          });

        setIsLoading(false);
        navigate("/dashboard");
      } else {
        // Some other error occurred during signup
        console.error('Sign up error:', signUpError);
        toast.error(signUpError.message);
        setIsLoading(false);
      }

    } catch (error) {
      console.error('Error during login:', error);
      toast.error("An error occurred while logging in");
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};
