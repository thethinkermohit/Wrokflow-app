import { useEffect } from "react";
import { Task } from "../components/constants/taskData";

interface UseAutoSaveProps {
  tasks: Task[];
}

export function useAutoSave({ tasks }: UseAutoSaveProps) {
  useEffect(() => {
    const saveProgressDebounced = setTimeout(() => {
      try {
        localStorage.setItem('workflow-tracker-tasks', JSON.stringify(tasks));
        console.log("Progress auto-saved to local storage");
      } catch (error) {
        console.error("Error saving to local storage:", error);
      }
    }, 2000);

    return () => clearTimeout(saveProgressDebounced);
  }, [tasks]);
}