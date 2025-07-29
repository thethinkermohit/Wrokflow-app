// import { Progress } from "./ui/progress";
import { Task } from "./constants/taskData";
import { calculateStageProgress, isStageFullyCompleted } from "./utils/taskHelpers";

interface DashboardProps {
  tasks: Task[];
}

export function Dashboard({ tasks }: DashboardProps) {
  // Determine current active stage (first incomplete stage or last stage if all complete)
  const stages = ['stage1', 'stage2', 'stage3', 'stage4'] as const;
  
  let currentStageKey = 'stage1';
  for (const stage of stages) {
    if (!isStageFullyCompleted(tasks, stage)) {
      currentStageKey = stage;
      break;
    }
    // If this stage is complete, the current stage is this one (in case all are complete)
    currentStageKey = stage;
  }
  
  const currentStageNumber = stages.indexOf(currentStageKey as any) + 1;
  const currentStage = `Stage ${currentStageNumber}`;
  
  // Calculate real progress from actual task data
  const { currentStageCheckboxes, currentStageCompleted } = calculateStageProgress(tasks, currentStageKey);
  
  const progressPercentage = currentStageCheckboxes > 0 
    ? Math.round((currentStageCompleted / currentStageCheckboxes) * 100) 
    : 0;

  return (
    <div className="h-full overflow-y-auto p-4" style={{ background: 'var(--background)' }}>
      {/* Enhanced Header with 3D Progress Ring */}
      <div className="mb-6">
        <div className="glass-card p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: 'var(--primary)' }}></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full" style={{ background: 'var(--secondary)' }}></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--success)' }}></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Current Stage
                </h2>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-semibold text-gray-700">{currentStage}</span>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  progressPercentage === 100 
                    ? 'bg-green-100 text-green-700' 
                    : progressPercentage > 50 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {progressPercentage === 100 ? 'Complete!' : 'In Progress'}
                </div>
              </div>
              
              {/* Enhanced Progress Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--primary-solid)' }}>
                    {progressPercentage}%
                  </span>
                </div>
                
                {/* Custom Medical Progress Bar */}
                <div className="medical-progress">
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                      progressPercentage === 100 ? 'success' : ''
                    }`}
                    style={{ 
                      width: `${progressPercentage}%`,
                      background: progressPercentage === 100 ? 'var(--success)' : 'var(--primary)'
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">
                    {currentStageCompleted} of {currentStageCheckboxes} tasks completed
                  </span>
                  <span className="text-gray-400">
                    {currentStageCheckboxes - currentStageCompleted} remaining
                  </span>
                </div>
              </div>
            </div>
            
            {/* 3D Progress Ring */}
            <div className="ml-6 hidden sm:block">
              <div className="progress-ring float">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercentage * 2.51} 251`}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: 'var(--primary-solid)' }}>
                      {progressPercentage}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">COMPLETE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dashboard Content */}
      <div className="space-y-6 pb-4">
        
        {/* Beautiful Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="stats-card group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
                  {currentStageCompleted}
                </div>
                <div className="text-xs text-gray-500 font-medium">COMPLETED</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">Tasks finished today</div>
          </div>

          <div className="stats-card group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600 group-hover:scale-110 transition-transform duration-300">
                  {currentStageCheckboxes - currentStageCompleted}
                </div>
                <div className="text-xs text-gray-500 font-medium">REMAINING</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">Tasks left to do</div>
          </div>
        </div>

        {/* Enhanced Stage Overview with Medical Theme */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Workflow Stages</h3>
          </div>
          
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const stageNumber = index + 1;
              const isCompleted = isStageFullyCompleted(tasks, stage);
              const { currentStageCompleted: stageCompleted, currentStageCheckboxes: stageTotal } = calculateStageProgress(tasks, stage);
              
              if (stageTotal === 0) return null;
              
              const isActive = stage === currentStageKey;
              const stageProgress = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;
              
              // Stage-specific gradient colors
              // Using refined color scheme: blue/grey/purple variations
              const stageColors = [
                'from-blue-500 to-blue-600',      // Stage 1: Primary Blue
                'from-slate-500 to-slate-600',    // Stage 2: Secondary Grey
                'from-purple-500 to-purple-600',  // Stage 3: Purple Accent
                'from-blue-700 to-blue-800'       // Stage 4: Dark Blue
              ];
              
              return (
                <div 
                  key={stage} 
                  className={`stage-indicator ${isActive ? 'active' : ''} group cursor-pointer hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Stage Status Icon */}
                      <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-r ${stageColors[index]} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                        {isCompleted ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : stageCompleted > 0 ? (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        ) : (
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                        )}
                        
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                      </div>
                      
                      {/* Stage Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">Stage {stageNumber}</span>
                          {isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {isCompleted ? '✨ Completed' : 
                           stageCompleted > 0 ? `${stageCompleted}/${stageTotal} tasks` : 
                           '⏳ Not started'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        isCompleted ? 'text-green-600' : 
                        stageCompleted > 0 ? 'text-blue-600' : 
                        'text-gray-400'
                      } transition-colors duration-300`}>
                        {stageProgress}%
                      </div>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full bg-gradient-to-r ${stageColors[index]} transition-all duration-700 ease-out`}
                          style={{ width: `${stageProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Quote Card */}
        <div className="glass-card p-4 text-center border-l-4 border-l-blue-500">
          <div className="text-sm text-gray-600 italic mb-1">
            "Every small step brings you closer to excellence in patient care."
          </div>
          <div className="text-xs text-gray-400 font-medium">- Workflow Tracker ✨</div>
        </div>
      </div>
    </div>
  );
}