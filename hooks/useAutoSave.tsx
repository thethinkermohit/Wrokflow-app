import { useEffect } from "react";
import { Task } from "../components/constants/taskData";
import { apiClient } from "../utils/supabase/client";

interface UseAutoSaveProps {
  tasks: Task[];
  isAuthenticated: boolean;
  currentUser: any;
  onAuthError: () => void;
}

export function useAutoSave({ tasks, isAuthenticated, currentUser, onAuthError }: UseAutoSaveProps) {
  // Auto-save progress when tasks change (debounced)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const saveProgressDebounced = setTimeout(async () => {
      try {
        await apiClient.saveProgress(tasks);
        console.log("Progress auto-saved");
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(
          "Error auto-saving progress:",
          errorMessage,
        );

        // If it's an auth error, trigger auth error callback
        if (
          error instanceof Error &&
          error.message &&
          (error.message.includes("Invalid") ||
            error.message.includes("expired"))
        ) {
          console.log(
            "Auto-save failed due to session issue, clearing session",
          );
          onAuthError();
        }
      }
    }, 2000); // Save after 2 seconds of no changes

    return () => clearTimeout(saveProgressDebounced);
  }, [tasks, isAuthenticated, currentUser, onAuthError]);
}