import { Task, TaskAnalytics, DailyCompletionData, WeeklyCompletionData, MonthlyCompletionData } from "../constants/taskData";

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

// Analytics and Data Tracking Functions

// Update task metadata when checkboxes are modified
export const updateTaskMetadata = (task: Task, checkboxId: string, completed: boolean): Task => {
  const now = new Date().toISOString();
  const updatedTask = { ...task };
  
  // Initialize metadata if it doesn't exist
  if (!updatedTask.metadata) {
    updatedTask.metadata = {
      createdAt: now,
      stageCompletedDates: {}
    };
  }

  // Update checkbox timestamp
  for (const stageKey of Object.keys(updatedTask.stages) as Array<keyof Task['stages']>) {
    const checkbox = updatedTask.stages[stageKey].find(cb => cb.id === checkboxId);
    if (checkbox) {
      if (completed) {
        checkbox.completedAt = now;
        // Set first completion if this is the first checkbox completed
        if (!updatedTask.metadata.firstCompletedAt) {
          updatedTask.metadata.firstCompletedAt = now;
        }
      } else {
        checkbox.uncompletedAt = now;
        delete checkbox.completedAt;
      }
      break;
    }
  }

  // Update last activity
  updatedTask.metadata.lastActivityAt = now;

  // Check if any stage is now fully completed
  for (const stageKey of Object.keys(updatedTask.stages) as Array<keyof Task['stages']>) {
    const stageCheckboxes = updatedTask.stages[stageKey];
    if (stageCheckboxes.length > 0 && stageCheckboxes.every(cb => cb.completed)) {
      if (!updatedTask.metadata.stageCompletedDates) {
        updatedTask.metadata.stageCompletedDates = {};
      }
      if (!updatedTask.metadata.stageCompletedDates[stageKey]) {
        updatedTask.metadata.stageCompletedDates[stageKey] = now;
      }
    }
  }

  return updatedTask;
};

// Generate daily completion data from tasks
export const generateDailyCompletionData = (tasks: Task[], fromDate?: Date, toDate?: Date): DailyCompletionData[] => {
  const start = fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const end = toDate || new Date();
  
  const dailyData: DailyCompletionData[] = [];
  const dataMap = new Map<string, DailyCompletionData>();

  // Initialize empty data for each day
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dataMap.set(dateStr, {
      date: dateStr,
      completed: 0,
      taskBreakdown: {},
      stageBreakdown: { stage1: 0, stage2: 0, stage3: 0, stage4: 0 }
    });
  }

  // Process all checkboxes and their completion dates
  tasks.forEach(task => {
    Object.entries(task.stages).forEach(([stageKey, checkboxes]) => {
      checkboxes.forEach(checkbox => {
        if (checkbox.completed && checkbox.completedAt) {
          const completionDate = new Date(checkbox.completedAt);
          const dateStr = completionDate.toISOString().split('T')[0];
          
          if (dataMap.has(dateStr)) {
            const dayData = dataMap.get(dateStr)!;
            dayData.completed++;
            dayData.taskBreakdown[task.id] = (dayData.taskBreakdown[task.id] || 0) + 1;
            dayData.stageBreakdown[stageKey as keyof typeof dayData.stageBreakdown]++;
          }
        }
      });
    });
  });

  return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

// Generate weekly completion data
export const generateWeeklyCompletionData = (tasks: Task[], weeks: number = 12): WeeklyCompletionData[] => {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  
  const dailyData = generateDailyCompletionData(tasks, startDate, endDate);
  const weeklyData: WeeklyCompletionData[] = [];

  // Group daily data into weeks
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    
    const weekDailyData = dailyData.filter(day => 
      day.date >= weekStartStr && day.date <= weekEndStr
    );
    
    const totalCompleted = weekDailyData.reduce((sum, day) => sum + day.completed, 0);
    
    weeklyData.push({
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      totalCompleted,
      dailyBreakdown: weekDailyData,
      averagePerDay: weekDailyData.length > 0 ? totalCompleted / weekDailyData.length : 0
    });
  }

  return weeklyData;
};

// Generate monthly completion data
export const generateMonthlyCompletionData = (tasks: Task[], months: number = 6): MonthlyCompletionData[] => {
  const endDate = new Date();
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - months + 1, 1);
  
  const monthlyData: MonthlyCompletionData[] = [];

  for (let i = 0; i < months; i++) {
    const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    const monthStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
    
    const dailyData = generateDailyCompletionData(tasks, monthStart, monthEnd);
    const weeklyData = generateWeeklyCompletionData(tasks, 4).filter(week => 
      week.weekStart.startsWith(monthStr.substring(0, 7))
    );
    
    const totalCompleted = dailyData.reduce((sum, day) => sum + day.completed, 0);
    const workingDays = dailyData.filter(day => day.completed > 0).length;
    
    // Find most/least productive days
    const sortedDays = dailyData.filter(day => day.completed > 0).sort((a, b) => b.completed - a.completed);
    
    monthlyData.push({
      month: monthStr,
      totalCompleted,
      dailyBreakdown: dailyData,
      weeklyBreakdown: weeklyData,
      averagePerDay: workingDays > 0 ? totalCompleted / workingDays : 0,
      mostProductiveDay: sortedDays[0]?.date || '',
      leastProductiveDay: sortedDays[sortedDays.length - 1]?.date || ''
    });
  }

  return monthlyData;
};

// Comprehensive analytics function
export const generateTaskAnalytics = (tasks: Task[]): TaskAnalytics => {
  const totalTasks = tasks.length;
  let totalCheckboxes = 0;
  let completedCheckboxes = 0;

  // Calculate overall progress
  const stageProgress = {
    stage1: { total: 0, completed: 0, percentage: 0 },
    stage2: { total: 0, completed: 0, percentage: 0 },
    stage3: { total: 0, completed: 0, percentage: 0 },
    stage4: { total: 0, completed: 0, percentage: 0 }
  };

  // Calculate task-specific progress
  const taskProgress = tasks.map(task => {
    const taskTotal = Object.values(task.stages).reduce((sum, stage) => sum + stage.length, 0);
    const taskCompleted = Object.values(task.stages).reduce((sum, stage) => 
      sum + stage.filter(checkbox => checkbox.completed).length, 0);
    
    totalCheckboxes += taskTotal;
    completedCheckboxes += taskCompleted;

    // Update stage progress
    Object.entries(task.stages).forEach(([stageKey, checkboxes]) => {
      const stage = stageProgress[stageKey as keyof typeof stageProgress];
      stage.total += checkboxes.length;
      stage.completed += checkboxes.filter(cb => cb.completed).length;
    });

    return {
      id: task.id,
      name: task.name,
      total: taskTotal,
      completed: taskCompleted,
      percentage: taskTotal > 0 ? Math.round((taskCompleted / taskTotal) * 100) : 0,
      lastActivity: task.metadata?.lastActivityAt
    };
  });

  // Calculate stage percentages
  Object.keys(stageProgress).forEach(stageKey => {
    const stage = stageProgress[stageKey as keyof typeof stageProgress];
    stage.percentage = stage.total > 0 ? Math.round((stage.completed / stage.total) * 100) : 0;
  });

  const completionRate = totalCheckboxes > 0 ? Math.round((completedCheckboxes / totalCheckboxes) * 100) : 0;

  // Generate time-based data
  const dailyData = generateDailyCompletionData(tasks);
  const weeklyData = generateWeeklyCompletionData(tasks);
  const monthlyData = generateMonthlyCompletionData(tasks);

  // Calculate insights
  const workingDays = dailyData.filter(day => day.completed > 0);
  const totalWorkingDays = workingDays.length;
  
  // Calculate streak (consecutive days with activity)
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const sortedDays = dailyData.sort((a, b) => b.date.localeCompare(a.date));
  
  for (const day of sortedDays) {
    if (day.completed > 0) {
      currentStreak++;
    } else if (day.date < today) {
      break;
    }
  }

  // Find most productive day
  const mostProductiveDay = workingDays.reduce((max, day) => 
    day.completed > max.completed ? day : max, 
    { completed: 0, date: '' }
  ).date;

  return {
    totalTasks,
    totalCheckboxes,
    completedCheckboxes,
    completionRate,
    stageProgress,
    taskProgress,
    dailyData,
    weeklyData,
    monthlyData,
    insights: {
      mostProductiveDay,
      streakCount: currentStreak,
      totalWorkingDays
    }
  };
};

// Get daily completion data for current month (real data only)
export const getCurrentMonthDailyData = (tasks: Task[]): DailyCompletionData[] => {
  const currentDate = new Date();
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  return generateDailyCompletionData(tasks, monthStart, monthEnd);
};

