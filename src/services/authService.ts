
import { toast } from "sonner";

// Hardcoded credentials
const ADMIN_EMAIL = "admin@brightcandy.ai";
const ADMIN_PASSWORD = "admin123";

// In-memory session storage
let currentUser: { email: string } | null = null;

export const authService = {
  // Login function
  login: async (email: string, password: string) => {
    // Simple validation
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      currentUser = { email };
      // Store in local storage for persistence across page reloads
      localStorage.setItem('user', JSON.stringify(currentUser));
      return { user: currentUser, error: null };
    }
    
    return { 
      user: null, 
      error: {
        message: "Invalid email or password"
      }
    };
  },

  // Sign up function (just uses the same login in this simple example)
  signUp: async (email: string, password: string) => {
    if (email === ADMIN_EMAIL) {
      return { 
        user: null, 
        error: {
          message: "User already exists"
        }
      };
    }
    
    // In a real app we would create a new user here
    // For this example, we'll just reject any signup that isn't the admin
    return { 
      user: null, 
      error: {
        message: "Only admin user is allowed"
      }
    };
  },

  // Get current user
  getUser: async () => {
    if (!currentUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    }
    
    return { user: currentUser };
  },

  // Logout function
  logout: async () => {
    currentUser = null;
    localStorage.removeItem('user');
    return { error: null };
  }
};

