import type { TaskAnalytics, DailyCompletionData } from '../constants/taskData';

// Generate mock data for July 2025 daily task completion
export const generateJulyData = () => {
  const daysInJuly = 31;
  const data = [];
  
  for (let day = 1; day <= daysInJuly; day++) {
    // Generate realistic task completion patterns
    const isWeekend = new Date(2025, 6, day).getDay() === 0 || new Date(2025, 6, day).getDay() === 6;
    const isMonday = new Date(2025, 6, day).getDay() === 1;
    
    let tasks = Math.floor(Math.random() * 8) + 2; // Base 2-10 tasks
    
    // Adjust based on day patterns
    if (isWeekend) tasks = Math.max(1, tasks - 3); // Fewer tasks on weekends
    if (isMonday) tasks += 2; // More tasks on Mondays
    
    // Add some variation for realistic patterns
    if (day <= 7) tasks += 1; // First week boost
    if (day >= 25) tasks += Math.floor(Math.random() * 3); // End of month push
    
    data.push({
      day: day.toString(),
      tasks: Math.min(tasks, 12), // Cap at 12 tasks
      dayName: new Date(2025, 6, day).toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  return data;
};

// Generate smart insights based on data patterns
export const generateInsights = (data: any[]) => {
  const weekdayTasks = data.filter(d => !['Sat', 'Sun'].includes(d.dayName));
  const weekendTasks = data.filter(d => ['Sat', 'Sun'].includes(d.dayName));
  const mondayTasks = data.filter(d => d.dayName === 'Mon');
  
  const avgWeekday = Math.round(weekdayTasks.reduce((sum, d) => sum + d.tasks, 0) / weekdayTasks.length);
  const avgWeekend = Math.round(weekendTasks.reduce((sum, d) => sum + d.tasks, 0) / weekendTasks.length);
  const avgMonday = Math.round(mondayTasks.reduce((sum, d) => sum + d.tasks, 0) / mondayTasks.length);
  
  const maxDay = data.reduce((max, d) => d.tasks > max.tasks ? d : max);
  const minDay = data.reduce((min, d) => d.tasks < min.tasks ? d : min);
  
  // Weekly analysis
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    const weekData = data.slice(i, i + 7);
    const weekTotal = weekData.reduce((sum, d) => sum + d.tasks, 0);
    weeks.push({ week: Math.floor(i / 7) + 1, total: weekTotal });
  }
  const bestWeek = weeks.reduce((max, w) => w.total > max.total ? w : max);
  
  const insights = [
    {
      icon: "TrendingUp",
      title: "Monday Momentum",
      description: `You average ${avgMonday} tasks on Mondays - ${avgMonday > avgWeekday ? 'above' : 'below'} your weekday average`,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: "Calendar",
      title: "Weekday vs Weekend",
      description: `You complete ${Math.round(((avgWeekday - avgWeekend) / avgWeekend) * 100)}% more tasks on weekdays than weekends`,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: "Target",
      title: "Peak Performance",
      description: `Your most productive day was July ${maxDay.day} with ${maxDay.tasks} tasks completed`,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: "Clock",
      title: "Weekly Champion",
      description: `Week ${bestWeek.week} was your strongest with ${bestWeek.total} total tasks completed`,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: "Award",
      title: "Consistency Score",
      description: `Your task completion varies by ${Math.round((maxDay.tasks - minDay.tasks) / avgWeekday * 100)}% - ${Math.round((maxDay.tasks - minDay.tasks) / avgWeekday * 100) < 50 ? 'very consistent!' : 'room to smooth out peaks'}`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      icon: "Brain",
      title: "Pattern Recognition",
      description: `You tend to complete ${Math.round(((data.slice(0, 15).reduce((sum, d) => sum + d.tasks, 0) / 15) / (data.slice(15).reduce((sum, d) => sum + d.tasks, 0) / (data.length - 15))) * 100)}% more tasks in the first half of the month`,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ];
  
  return insights;
};

// Generate insights from real analytics data
export const generateRealInsights = (analytics: TaskAnalytics, dailyData: DailyCompletionData[]) => {
  const workingDays = dailyData.filter(day => day.completed > 0);
  const weekdayTasks = workingDays.filter(day => {
    const dayOfWeek = new Date(day.date).getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  });
  const weekendTasks = workingDays.filter(day => {
    const dayOfWeek = new Date(day.date).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  });
  
  const insights = [];
  
  // Completion rate insight
  if (analytics.completionRate >= 80) {
    insights.push({
      icon: "Award",
      title: "Excellence Achievement",
      description: `Outstanding ${analytics.completionRate}% completion rate! You're demonstrating exceptional commitment to your dental practice development.`,
      color: "text-green-600",
      bgColor: "bg-green-50"
    });
  } else if (analytics.completionRate >= 50) {
    insights.push({
      icon: "Target",
      title: "Good Progress",
      description: `You've completed ${analytics.completionRate}% of your tasks. Keep up the momentum to reach the next milestone!`,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    });
  } else {
    insights.push({
      icon: "TrendingUp",
      title: "Building Foundation",
      description: `You're at ${analytics.completionRate}% completion. Focus on consistent daily progress to build strong habits.`,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    });
  }
  
  // Stage progress insight
  const stageEntries = Object.entries(analytics.stageProgress);
  const bestStage = stageEntries.reduce((max, [stage, data]: [string, any]) => 
    data.percentage > max.percentage ? { stage, percentage: data.percentage } : max,
    { stage: '', percentage: 0 }
  );
  
  if (bestStage.percentage > 0) {
    insights.push({
      icon: "Brain",
      title: "Stage Strength",
      description: `Your strongest area is ${bestStage.stage.replace('stage', 'Stage ')} with ${bestStage.percentage}% completion. This shows excellent focus in this domain.`,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    });
  }
  
  // Consistency insight
  if ((analytics.insights?.streakCount || 0) >= 7) {
    insights.push({
      icon: "Calendar",
      title: "Consistency Champion",
      description: `Impressive ${analytics.insights?.streakCount || 0}-day activity streak! This consistency is key to mastering dental procedures.`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    });
  } else if ((analytics.insights?.totalWorkingDays || 0) >= 5) {
    insights.push({
      icon: "Clock",
      title: "Building Momentum",
      description: `You've been active for ${analytics.insights?.totalWorkingDays || 0} days. Try to maintain regular practice for optimal skill development.`,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    });
  }
  
  // Top performing tasks insight
  const topTasks = analytics.taskProgress.filter(task => task.percentage >= 80).slice(0, 3);
  if (topTasks.length > 0) {
    insights.push({
      icon: "Target",
      title: "Specialty Excellence",
      description: `You're excelling in ${topTasks.map(t => t.name).join(', ')}. This expertise will benefit your patients significantly.`,
      color: "text-green-600",
      bgColor: "bg-green-50"
    });
  }
  
  // Working pattern insight
  if (weekdayTasks.length > 0 && weekendTasks.length > 0) {
    const weekdayAvg = weekdayTasks.reduce((sum, day) => sum + day.completed, 0) / weekdayTasks.length;
    const weekendAvg = weekendTasks.reduce((sum, day) => sum + day.completed, 0) / weekendTasks.length;
    const difference = Math.round(((weekdayAvg - weekendAvg) / weekendAvg) * 100);
    
    insights.push({
      icon: "Calendar",
      title: "Work-Life Balance",
      description: `You complete ${Math.abs(difference)}% ${difference > 0 ? 'more' : 'fewer'} tasks on weekdays. ${difference > 50 ? 'Consider balanced weekend practice too.' : 'Good work-life balance!'}`,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    });
  }
  
  return insights.slice(0, 6); // Return top 6 insights
};