// This file is no longer needed - authentication has been removed
import { INITIAL_TASKS, Task } from "../components/constants/taskData";

export function useAuth() {
  return {
    isAuthenticated: true,
    currentUser: null,
    isLoading: false,
    tasks: INITIAL_TASKS,
    setTasks: () => {},
    handleLogin: async () => ({ success: true }),
    handleLogout: async () => {},
    loadUserProgress: async () => {},
  };
}