// import { Checkbox } from "./ui/checkbox";
import { Task } from "./constants/taskData";

interface TaskCardProps {
  task: Task;
  stageKey: keyof Task['stages'];
  onToggleCheckbox: (taskId: string, stageKey: keyof Task['stages'], checkboxId: string) => void;
  isUnlocked: boolean;
}

export function TaskCard({ task, stageKey, onToggleCheckbox, isUnlocked }: TaskCardProps) {
  const stageCheckboxes = task.stages[stageKey];
  const completedCount = stageCheckboxes.filter(checkbox => checkbox.completed).length;

  // Don't render task card if no checkboxes in this stage
  if (stageCheckboxes.length === 0) {
    return null;
  }

  const progressPercentage = Math.round((completedCount / stageCheckboxes.length) * 100);
  const isCompleted = completedCount === stageCheckboxes.length;

  return (
    <div 
      className={`glass-card p-5 transition-all duration-300 hover:scale-[1.01] group ${
        !isUnlocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      } ${isCompleted ? 'pulse-completed' : ''}`}
    >
      {/* Task Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Medical Icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isCompleted 
              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' 
              : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
          }`}>
            {isCompleted ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
              {task.name}
            </h3>
            <div className="text-xs text-gray-500">
              {completedCount} of {stageCheckboxes.length} tasks
            </div>
          </div>
        </div>
        
        {!isUnlocked ? (
          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Locked
          </div>
        ) : isCompleted ? (
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Complete!
          </div>
        ) : null}
      </div>
      
      {/* Enhanced Checkbox Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {stageCheckboxes.map((checkbox) => (
          <div 
            key={checkbox.id} 
            className="relative flex items-center justify-center group/checkbox"
          >
            {/* Custom Medical Checkbox */}
            <button
              onClick={() => isUnlocked && onToggleCheckbox(task.id, stageKey, checkbox.id)}
              disabled={!isUnlocked}
              className={`medical-checkbox transition-all duration-200 hover:scale-105 ${
                checkbox.completed 
                  ? 'bg-green-500 border-green-500' 
                  : 'hover:border-blue-500 hover:bg-blue-50'
              } ${!isUnlocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              {checkbox.completed && (
                <svg 
                  className="absolute inset-0 w-full h-full p-1 text-white transition-transform duration-200 scale-100" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            

          </div>
        ))}
      </div>

      {/* Enhanced Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 font-medium">Progress</span>
          <span className={`font-bold ${
            progressPercentage === 100 ? 'text-green-600' : 
            progressPercentage > 50 ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {progressPercentage}%
          </span>
        </div>
        
        <div className="medical-progress">
          <div 
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
              progressPercentage === 100 ? 'success' : ''
            }`}
            style={{ 
              width: `${progressPercentage}%`,
              background: progressPercentage === 100 
                ? '#22c55e' 
                : '#3b82f6'
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>{completedCount} completed</span>
          <span>{stageCheckboxes.length - completedCount} remaining</span>
        </div>
      </div>

      {/* Completion Celebration Effect */}
      {isCompleted && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <div className="celebration-particle"></div>
          <div className="celebration-particle" style={{animationDelay: '0.2s'}}></div>
          <div className="celebration-particle" style={{animationDelay: '0.4s'}}></div>
        </div>
      )}
    </div>
  );
}