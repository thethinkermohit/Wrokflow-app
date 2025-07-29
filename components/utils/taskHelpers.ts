import { Task } from "../constants/taskData";

export const isStageUnlocked = (task: Task, stageKey: keyof Task['stages']) => {
  const stageOrder = ['stage1', 'stage2', 'stage3', 'stage4'];
  const currentStageIndex = stageOrder.indexOf(stageKey);
  
  // Stage 1 is always unlocked
  if (currentStageIndex === 0) return true;
  
  // Check if all previous stages are completed
  for (let i = 0; i < currentStageIndex; i++) {
    const prevStageKey = stageOrder[i] as keyof Task['stages'];
    const prevStageCheckboxes = task.stages[prevStageKey];
    // If previous stage has no checkboxes, consider it completed
    if (prevStageCheckboxes.length === 0) continue;
    // Otherwise, all checkboxes must be completed
    const allCompleted = prevStageCheckboxes.every(checkbox => checkbox.completed);
    if (!allCompleted) return false;
  }
  
  return true;
};

export const isStageTabEnabled = (tasks: Task[], stageKey: keyof Task['stages']) => {
  // A stage tab is enabled if at least one task has that stage unlocked
  return tasks.some(task => isStageUnlocked(task, stageKey));
};

export const isStageFullyCompleted = (tasks: Task[], stageKey: keyof Task['stages']) => {
  return tasks.every(task => {
    const stageCheckboxes = task.stages[stageKey];
    // If stage has no checkboxes, consider it completed
    if (stageCheckboxes.length === 0) return true;
    // Otherwise, all checkboxes must be completed
    return stageCheckboxes.every(checkbox => checkbox.completed);
  });
};

export const calculateStageProgress = (tasks: Task[], currentStage: string) => {
  const currentStageCheckboxes = tasks.reduce((total, task) => {
    return total + task.stages[currentStage as keyof Task['stages']].length;
  }, 0);

  const currentStageCompleted = tasks.reduce((total, task) => {
    return total + task.stages[currentStage as keyof Task['stages']].filter(checkbox => checkbox.completed).length;
  }, 0);

  return { currentStageCheckboxes, currentStageCompleted };
};