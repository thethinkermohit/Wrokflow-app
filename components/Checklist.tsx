import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CelebrationModal } from "./CelebrationModal";
import { RewardModal } from "./RewardModal";
import { TaskCard } from "./TaskCard";
import { Task } from "./constants/taskData";
import { 
  isStageUnlocked, 
  isStageTabEnabled, 
  isStageFullyCompleted, 
  calculateStageProgress,
  updateTaskMetadata
} from "./utils/taskHelpers";

interface ChecklistProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  initialStage?: string | null;
  onStageChange?: () => void;
}

export function Checklist({ tasks, setTasks, initialStage, onStageChange }: ChecklistProps) {
  const [currentStage, setCurrentStage] = useState<string>("stage1");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [celebratingStage, setCelebratingStage] = useState<number>(1);
  const previousCompletionState = useRef<{ [key: string]: boolean }>({});

  // Effect to handle initial stage from navigation
  useEffect(() => {
    if (initialStage && initialStage !== currentStage) {
      setCurrentStage(initialStage);
      // Call onStageChange to clear the initialStage in parent
      onStageChange?.();
    }
  }, [initialStage, currentStage, onStageChange]);

  const toggleCheckbox = (taskId: string, stageKey: keyof Task['stages'], checkboxId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !isStageUnlocked(task, stageKey)) return;

    setTasks(tasks.map(currentTask => {
      if (currentTask.id === taskId) {
        // Find the checkbox to get its current state
        const checkbox = currentTask.stages[stageKey].find(cb => cb.id === checkboxId);
        if (!checkbox) return currentTask;
        
        const newCompletedState = !checkbox.completed;
        
        // Update the task with new checkbox state
        const updatedTask = {
          ...currentTask,
          stages: {
            ...currentTask.stages,
            [stageKey]: currentTask.stages[stageKey].map(cb =>
              cb.id === checkboxId
                ? { ...cb, completed: newCompletedState }
                : cb
            )
          }
        };
        
        // Update metadata with tracking information
        return updateTaskMetadata(updatedTask, checkboxId, newCompletedState);
      }
      return currentTask;
    }));
  };

  const { currentStageCheckboxes, currentStageCompleted } = calculateStageProgress(tasks, currentStage);

  // Effect to detect stage completion and trigger celebration
  useEffect(() => {
    const stageOrder: (keyof Task['stages'])[] = ['stage1', 'stage2', 'stage3', 'stage4'];
    
    for (const stage of stageOrder) {
      const isCurrentlyCompleted = isStageFullyCompleted(tasks, stage);
      const wasCompleted = previousCompletionState.current[stage] || false;
      
      // Only trigger celebration if stage just became completed (transition from false to true)
      if (isCurrentlyCompleted && !wasCompleted) {
        // Update the previous state
        previousCompletionState.current[stage] = true;
        
        // Set which stage we're celebrating
        const stageNumber = stageOrder.indexOf(stage) + 1;
        setCelebratingStage(stageNumber);
        
        // Show special reward modal for Stage 2, regular celebration for others
        if (stage === 'stage2') {
          setShowReward(true);
        } else {
          setShowCelebration(true);
        }
        
        // Auto-advance to next stage after celebration
        const currentIndex = stageOrder.indexOf(stage);
        if (currentIndex < stageOrder.length - 1) {
          const nextStage = stageOrder[currentIndex + 1];
          setTimeout(() => {
            setCurrentStage(nextStage);
          }, 3000); // Slightly longer delay for reward modal
        }
        
        break; // Only celebrate one stage at a time
      } else if (!isCurrentlyCompleted && wasCompleted) {
        // If stage became incomplete, update the previous state
        previousCompletionState.current[stage] = false;
      } else if (isCurrentlyCompleted && !previousCompletionState.current.hasOwnProperty(stage)) {
        // Initialize the previous state for already completed stages (on first load)
        previousCompletionState.current[stage] = true;
      }
    }
  }, [tasks]);

  const handleCelebrationClose = () => {
    setShowCelebration(false);
  };

  const handleRewardClose = () => {
    setShowReward(false);
  };

  return (
    <>
      <CelebrationModal
        isOpen={showCelebration}
        onClose={handleCelebrationClose}
        stage={celebratingStage}
      />
      
      <RewardModal
        isOpen={showReward}
        onClose={handleRewardClose}
      />
      
    <div className="flex flex-col h-full bg-white">
      {/* Progress Header */}
      <div className="bg-white p-4 shadow-sm flex-shrink-0">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">
              {currentStage.charAt(0).toUpperCase() + currentStage.slice(1).replace(/(\d)/, ' $1')} Progress
            </span>
            <span className="text-sm font-medium text-blue-800">
              {currentStageCompleted}/{currentStageCheckboxes} completed
            </span>
          </div>
        </div>
      </div>

      {/* Stage Tabs and Content */}
      <div className="flex flex-col flex-1 min-h-0 bg-white border-b border-gray-200">
        <Tabs 
          value={currentStage} 
          onValueChange={(value) => {
            setCurrentStage(value);
            onStageChange?.();
          }} 
          className="w-full flex flex-col h-full"
        >
          <TabsList className="grid w-full grid-cols-4 rounded-none h-auto bg-transparent flex-shrink-0">
            <TabsTrigger 
              value="stage1" 
              disabled={!isStageTabEnabled(tasks, 'stage1')}
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              Stage 1
            </TabsTrigger>
            <TabsTrigger 
              value="stage2" 
              disabled={!isStageTabEnabled(tasks, 'stage2')}
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              Stage 2
            </TabsTrigger>
            <TabsTrigger 
              value="stage3" 
              disabled={!isStageTabEnabled(tasks, 'stage3')}
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              Stage 3
            </TabsTrigger>
            <TabsTrigger 
              value="stage4" 
              disabled={!isStageTabEnabled(tasks, 'stage4')}
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              Stage 4
            </TabsTrigger>
          </TabsList>

          {/* Stage Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="stage1" className="mt-0 p-4 space-y-4 h-full">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  stageKey="stage1" 
                  onToggleCheckbox={toggleCheckbox}
                  isUnlocked={isStageUnlocked(task, 'stage1')}
                />
              ))}
            </TabsContent>

            <TabsContent value="stage2" className="mt-0 p-4 space-y-4 h-full">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  stageKey="stage2" 
                  onToggleCheckbox={toggleCheckbox}
                  isUnlocked={isStageUnlocked(task, 'stage2')}
                />
              ))}
            </TabsContent>

            <TabsContent value="stage3" className="mt-0 p-4 space-y-4 h-full">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  stageKey="stage3" 
                  onToggleCheckbox={toggleCheckbox}
                  isUnlocked={isStageUnlocked(task, 'stage3')}
                />
              ))}
            </TabsContent>

            <TabsContent value="stage4" className="mt-0 p-4 space-y-4 h-full">
              {tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  stageKey="stage4" 
                  onToggleCheckbox={toggleCheckbox}
                  isUnlocked={isStageUnlocked(task, 'stage4')}
                />
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
    </>
  );
}