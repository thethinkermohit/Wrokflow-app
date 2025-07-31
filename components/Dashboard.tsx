import { Target } from "lucide-react";
import { Task } from "./constants/taskData";
import { calculateStageProgress, isStageFullyCompleted } from "./utils/taskHelpers";

interface DashboardProps {
  tasks: Task[];
  onStageClick: (stage: string) => void;
  onInsightsClick: () => void;
}

export function Dashboard({ tasks, onStageClick, onInsightsClick }: DashboardProps) {
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

  // Calculate month progress based on current date
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get total days in current month
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthProgressPercentage = Math.round((currentDay / totalDaysInMonth) * 100);

  // Helper function to create pie chart path
  const createPiePath = (percentage: number, radius: number, centerX: number, centerY: number) => {
    if (percentage >= 100) {
      return `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX - 0.1} ${centerY - radius} Z`;
    }
    
    const angle = (percentage / 100) * 2 * Math.PI;
    const x = centerX + radius * Math.sin(angle);
    const y = centerY - radius * Math.cos(angle);
    const largeArcFlag = percentage > 50 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x} ${y} Z`;
  };

  return (
    <div className="h-full overflow-y-auto p-4" style={{ background: 'var(--background)' }}>
      {/* Enhanced Header with Side-by-Side Layout */}
      <div className="mb-8">
        <div 
          className="current-stage-card relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          onClick={onInsightsClick}
        >
          {/* Header Layout - Compact Top Section */}
          <div className="px-4 pt-2 pb-3">
            {/* Horizontal Layout: Left Header + Right Progress Ring */}
            <div className="flex items-start justify-between gap-4 -mt-1">
              {/* Left Side: Header Information */}
              <div className="flex-1 min-w-0 mt-6">
                {/* Month & Year with Icon */}
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Target className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>

                  </div>
                </div>
                
                {/* Stage Info with Badge - Compact */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg font-semibold text-gray-800">{currentStage}</span>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                    progressPercentage === 100 
                      ? 'bg-green-500 text-white' 
                      : progressPercentage > 50 
                      ? 'bg-blue-500 text-white current-stage-badge' 
                      : 'bg-orange-500 text-white current-stage-badge orange'
                  }`}>
                    {progressPercentage === 100 ? 'Complete!' : 'In Progress'}
                  </div>
                </div>

                {/* Day Counter - Compact */}
                <div className="text-base text-gray-600 font-medium">
                  Day {currentDay} of {totalDaysInMonth}
                </div>
              </div>

              {/* Right Side: Progress Ring Assembly */}
              <div className="flex-shrink-0">
                {/* Desktop Version */}
                <div className="progress-ring-large hidden sm:block w-56 h-56">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Month Progress Pie Chart (Outer) */}
                  {monthProgressPercentage > 0 && (
                    <path
                      d={createPiePath(monthProgressPercentage, 70, 80, 80)}
                      fill="url(#monthPieGradient)"
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: 'drop-shadow(0 1px 3px rgba(75, 85, 99, 0.2))' }}
                    />
                  )}
                  
                  {/* Outer pie chart border */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="rgba(226, 232, 240, 0.6)"
                    strokeWidth="1"
                  />
                  
                  {/* Inner Task Progress Ring Background */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="none"
                    stroke="rgba(241, 245, 249, 0.25)"
                    strokeWidth="6"
                  />
                  
                  {/* Inner Task Progress Ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r="50"
                    fill="none"
                    stroke="url(#taskGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercentage * 3.14} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* Center hole to create donut effect */}
                  <circle
                    cx="80"
                    cy="80"
                    r="30"
                    fill="transparent"
                    stroke="rgba(241, 245, 249, 0.2)"
                    strokeWidth="1"
                    className="transition-all duration-300 ease-out"
                  />
                  
                  <defs>
                    <linearGradient id="monthPieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6b7280" />
                      <stop offset="50%" stopColor="#4b5563" />
                      <stop offset="100%" stopColor="#374151" />
                    </linearGradient>
                    <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Content - Task Count */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center bg-white rounded-full w-28 h-28 flex items-center justify-center shadow-xl border-2 border-gray-400 progress-center-display">
                    <div className="text-5xl font-bold text-blue-600 leading-none relative z-10">
                      {currentStageCompleted}
                    </div>
                  </div>
                </div>
                </div>
              
              {/* Mobile Compact Version */}
              <div className="progress-ring-elegant sm:hidden w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Month Progress Pie Chart (Outer) */}
                  {monthProgressPercentage > 0 && (
                    <path
                      d={createPiePath(monthProgressPercentage, 50, 60, 60)}
                      fill="url(#monthPieGradientMobile)"
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: 'drop-shadow(0 1px 3px rgba(75, 85, 99, 0.2))' }}
                    />
                  )}
                  
                  {/* Outer pie chart border */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(226, 232, 240, 0.6)"
                    strokeWidth="1"
                  />
                  
                  {/* Inner Task Progress Ring Background */}
                  <circle
                    cx="60"
                    cy="60"
                    r="35"
                    fill="none"
                    stroke="rgba(241, 245, 249, 0.25)"
                    strokeWidth="4"
                  />
                  
                  {/* Inner Task Progress Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r="35"
                    fill="none"
                    stroke="url(#taskGradientMobile)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercentage * 2.2} 220`}
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* Center hole to create donut effect */}
                  <circle
                    cx="60"
                    cy="60"
                    r="22"
                    fill="transparent"
                    stroke="rgba(241, 245, 249, 0.2)"
                    strokeWidth="1"
                    className="transition-all duration-300 ease-out"
                  />
                  
                  <defs>
                    <linearGradient id="monthPieGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6b7280" />
                      <stop offset="50%" stopColor="#4b5563" />
                      <stop offset="100%" stopColor="#374151" />
                    </linearGradient>
                    <linearGradient id="taskGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Content - Task Count */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-xl border-2 border-gray-400 progress-center-display">
                    <div className="text-4xl font-bold text-blue-600 leading-none relative z-10">
                      {currentStageCompleted}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Progress Section */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-gray-700">Progress</span>
              {/* Custom Medical Progress Bar - Full Width */}
              <div className="flex-1 medical-progress">
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
              <span className="text-2xl font-bold text-blue-600 ml-2">
                {progressPercentage}%
              </span>
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
                <div className="text-3xl font-bold text-green-600">
                  {currentStageCompleted}
                </div>
                <div className="text-sm text-gray-500 font-medium">COMPLETED</div>
              </div>
            </div>
            <div className="text-base text-gray-600">{currentStageCompleted > 0 ? 'Tasks completed in current stage' : 'No tasks completed yet'}</div>
          </div>

          <div className="stats-card group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600">
                  {currentStageCheckboxes - currentStageCompleted}
                </div>
                <div className="text-sm text-gray-500 font-medium">REMAINING</div>
              </div>
            </div>
            <div className="text-base text-gray-600">{currentStageCheckboxes > 0 ? 'Tasks remaining in current stage' : 'Start your first task'}</div>
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
            <h3 className="text-xl font-semibold text-gray-800">Workflow Stages</h3>
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
              const stageColors = [
                'from-purple-300 to-purple-400',
                'from-purple-400 to-purple-500',
                'from-purple-500 to-purple-600',
                'from-purple-600 to-purple-700'
              ];
              
              const stageColorsCompleted = [
                'from-green-300 to-green-400',
                'from-green-400 to-green-500',
                'from-green-500 to-green-600',
                'from-green-600 to-green-700'
              ];
              
              return (
                <div 
                  key={stage} 
                  className={`stage-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} group cursor-pointer hover:shadow-md`}
                  onClick={() => onStageClick(stage)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Stage Status Icon */}
                      <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-r ${isCompleted ? stageColorsCompleted[index] : stageColors[index]} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
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
                          <span className="text-lg font-medium text-gray-800">Stage {stageNumber}</span>
                          {isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="text-base text-gray-500">
                          {isCompleted ? '✨ Completed' : 
                           stageCompleted > 0 ? `${stageCompleted}/${stageTotal} tasks` : 
                           '⏳ Not started'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        isCompleted ? 'text-green-600' : 
                        stageCompleted > 0 ? 'text-purple-600' : 
                        'text-gray-400'
                      } transition-colors duration-300`}>
                        {stageProgress}%
                      </div>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className={`h-full bg-gradient-to-r ${isCompleted ? stageColorsCompleted[index] : stageColors[index]} transition-all duration-700 ease-out`}
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
          <div className="text-base text-gray-600 italic mb-1">
            "Track your monthly progress and build consistent excellence in patient care."
          </div>
          <div className="text-sm text-gray-400 font-medium">- Workflow Tracker ✨</div>
        </div>
      </div>
    </div>
  );
}