import { useState, useEffect } from "react";
import { INITIAL_TASKS, Task } from "../components/constants/taskData";
import { apiClient } from "../utils/supabase/client";

console.log('🔍 useAuth importing apiClient:', apiClient);
console.log('🔍 useAuth apiClient type:', typeof apiClient);

interface User {
  id: string;
  username: string;
  fullName: string;
  isAdmin: boolean;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  handleLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  handleLogout: () => Promise<void>;
  loadUserProgress: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (!apiClient || typeof apiClient.getSessionToken !== 'function') {
        console.error('❌ API Client is not properly initialized');
        throw new Error('API Client is not properly initialized');
      }
      
      const sessionToken = apiClient.getSessionToken();

      if (sessionToken) {
        // Validate session with server
        try {
          const profileResponse = await apiClient.getProfile();

          if (profileResponse && profileResponse.user) {
            setIsAuthenticated(true);
            setCurrentUser(profileResponse.user);

            // Load user's progress
            await loadUserProgress();
            console.log(
              "Session validated successfully for user:",
              profileResponse.user.username,
            );
          } else {
            console.log(
              "Invalid profile response, clearing session",
            );
            apiClient.setSessionToken(null);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(
            "Session validation failed, clearing session:",
            errorMessage,
          );
          // Clear invalid/expired session silently
          apiClient.setSessionToken(null);
          // Reset to initial state
          setIsAuthenticated(false);
          setCurrentUser(null);
          setTasks(INITIAL_TASKS);
        }
      } else {
        console.log("No session token found, showing login");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      // Ensure clean state on any error
      apiClient.setSessionToken(null);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setTasks(INITIAL_TASKS);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const response = await apiClient.loadProgress();
      if (response && response.tasks) {
        setTasks(response.tasks);
        console.log("Loaded user progress from server");
      } else {
        console.log(
          "No saved progress found, using default tasks",
        );
        setTasks(INITIAL_TASKS);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(
        "Could not load user progress:",
        errorMessage,
      );
      // If there's an error loading progress, continue with default tasks
      setTasks(INITIAL_TASKS);

      // If it's an auth error, clear the session
      if (
        error instanceof Error &&
        error.message &&
        (error.message.includes("Invalid") ||
          error.message.includes("expired"))
      ) {
        console.log(
          "Progress loading failed due to session issue, clearing session",
        );
        apiClient.setSessionToken(null);
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    }
  };

  const handleLogin = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.login(
        username,
        password,
      );

      if (
        response &&
        response.success &&
        response.sessionToken &&
        response.user
      ) {
        apiClient.setSessionToken(response.sessionToken);
        setIsAuthenticated(true);
        setCurrentUser(response.user);

        console.log(
          "Login successful for user:",
          response.user.username,
        );

        // Load user's progress after login
        await loadUserProgress();

        return { success: true };
      }

      const errorMessage =
        response?.error || "Invalid username or password";
      console.log("Login failed:", errorMessage);
      return { success: false, error: errorMessage };
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? 
        error.message || "Login failed. Please check your connection and try again." :
        "Login failed. Please check your connection and try again.";
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out user...");

      // Try to save progress before logout (but don't block logout if it fails)
      try {
        if (isAuthenticated && currentUser) {
          await apiClient.saveProgress(tasks);
          console.log("Progress saved before logout");
        }
      } catch (saveError) {
        console.log(
          "Could not save progress before logout:",
          saveError,
        );
      }

      // Notify server of logout (but don't block logout if it fails)
      try {
        await apiClient.logout();
        console.log("Server logout successful");
      } catch (logoutError) {
        console.log("Server logout failed:", logoutError);
      }
    } catch (error) {
      console.log("Logout process encountered errors:", error);
    } finally {
      // Always clean up local state regardless of server communication
      setIsAuthenticated(false);
      setCurrentUser(null);
      setTasks(INITIAL_TASKS);
      apiClient.setSessionToken(null);
      console.log("Local logout completed");
    }
  };

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    tasks,
    setTasks,
    handleLogin,
    handleLogout,
    loadUserProgress,
  };
}