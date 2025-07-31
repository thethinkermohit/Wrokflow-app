import { Task } from '../constants/taskData';
import { generateTaskAnalytics } from './taskHelpers';

export interface DentalSuggestion {
  category: string;
  title: string;
  description: string;
  tip: string;
}

// Generate smart dental practice suggestions based on comprehensive analytics
export const generateDentalSuggestions = (tasks: Task[]): DentalSuggestion[] => {
  const analytics = generateTaskAnalytics(tasks);
  const suggestions: DentalSuggestion[] = [];
  
  // Handle completely new users (no progress at all)
  if (analytics.completedCheckboxes === 0) {
    suggestions.push({
      category: "Getting Started",
      title: "Begin Your Dental Practice Journey",
      description: "Welcome to your Workflow Tracker! Start by completing tasks in Stage 1 - Consultation & Examination. Each completed task represents building fundamental skills for exceptional patient care.",
      tip: "Focus on one stage at a time. Complete all tasks in Stage 1 before moving to Stage 2."
    });
  }
  
  // Analyze completion rate
  else if (analytics.completionRate < 30) {
    suggestions.push({
      category: "Foundation Building",
      title: "Focus on Quality First Consultations",
      description: "Prioritize thorough and honest OPD consultations. Spend adequate time understanding each patient's concerns and needs. Quality initial consultations build trust and lead to better treatment acceptance.",
      tip: "Dedicate 15-20 minutes per initial consultation to truly understand patient concerns."
    });
  } else if (analytics.completionRate < 60) {
    suggestions.push({
      category: "Patient Education",
      title: "Enhance Patient Communication",
      description: "Focus on patient education regarding dental health rather than chasing quotas. Explain treatment options clearly and help patients understand the value of maintaining oral health.",
      tip: "Use visual aids and simple language to educate patients about their dental conditions."
    });
  } else if (analytics.completionRate < 80) {
    suggestions.push({
      category: "Service Excellence", 
      title: "Optimize Patient Experience",
      description: "Ensure all follow-up patients receive the promised quality care. Focus on punctuality, hassle-free appointment booking, and showing genuine compassion during treatments.",
      tip: "Implement a patient feedback system to continuously improve service quality."
    });
  } else {
    suggestions.push({
      category: "Advanced Excellence",
      title: "Systematic Treatment Planning",
      description: "Your high completion rate indicates excellent workflow management. Focus on systematic treatment planning and execution while maintaining the highest standards of cleanliness and expertise.",
      tip: "Document treatment protocols to maintain consistency across all patient interactions."
    });
  }

  // Find weakest stage using analytics data
  const weakestStage = Object.entries(analytics.stageProgress).reduce((min, [stage, data]) => 
    data.percentage < min.percentage ? { stage, percentage: data.percentage, total: data.total } : min,
    { stage: 'stage1', percentage: 100, total: 0 }
  );

  if (weakestStage.total > 0 && weakestStage.percentage < 80) {
    suggestions.push({
      category: "Workflow Optimization",
      title: `Strengthen ${weakestStage.stage.replace('stage', 'Stage ')} Performance`,
      description: `Your ${weakestStage.stage.replace('stage', 'Stage ')} is at ${weakestStage.percentage}% completion. Identify bottlenecks in this stage to ensure optimal patient care and practice efficiency.`,
      tip: "Review and streamline processes in underperforming stages to maintain workflow balance."
    });
  }

  // Add productivity insights based on daily data
  const workingDays = analytics.insights.totalWorkingDays || 0;
  const streakCount = analytics.insights.streakCount || 0;
  
  // For very new users, provide encouragement
  if (analytics.completedCheckboxes > 0 && analytics.completedCheckboxes < 5) {
    suggestions.push({
      category: "Early Progress",
      title: "Great Start - Keep Building Momentum",
      description: `You've completed ${analytics.completedCheckboxes} tasks! Each task completed represents growth in your dental skills. Consistency in practice leads to excellence in patient care.`,
      tip: "Try to complete at least one task each day to build a strong foundation."
    });
  }
  
  else if (workingDays > 7) {
    if (streakCount >= 7) {
      suggestions.push({
        category: "Consistency Excellence",
        title: "Outstanding Daily Commitment",
        description: `You've maintained a ${streakCount}-day completion streak! This consistency is key to building patient trust and achieving excellence in dental practice.`,
        tip: "Continue this momentum by setting daily goals and celebrating small wins."
      });
    } else if (workingDays > 14 && streakCount < 3) {
      suggestions.push({
        category: "Consistency Building",
        title: "Develop Regular Practice Habits",
        description: "Building consistent daily practice habits will accelerate your learning and improve patient outcomes. Consider establishing a routine practice schedule.",
        tip: "Set aside dedicated time each day for skill development, even if just 15-30 minutes."
      });
    }
  }

  // Add specialization insights based on task completion patterns
  const topPerformingTasks = analytics.taskProgress
    .filter(task => task.total > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  if (topPerformingTasks.length > 0 && topPerformingTasks[0].percentage >= 80) {
    const topTasks = topPerformingTasks.map(t => t.name).join(', ');
    suggestions.push({
      category: "Specialty Focus",
      title: "Advanced Treatment Excellence",
      description: `You're excelling in ${topTasks}. This expertise positions you well for complex cases and specialized patient care.`,
      tip: "Continue developing expertise in your strongest areas while maintaining broad competency across all procedures."
    });
  }

  // Ensure we always have at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      category: "Welcome",
      title: "Start Your Dental Excellence Journey",
      description: "Your Workflow Tracker is ready! Begin by exploring the different stages and completing tasks. Each stage represents crucial skills in modern dental practice, from consultation to advanced procedures.",
      tip: "Navigate to Checklist and start with Stage 1 tasks to begin your journey."
    });
  }
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
};