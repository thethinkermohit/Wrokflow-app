import jsPDF from 'jspdf';
import { Task } from '../constants/taskData';
import { generateTaskAnalytics, getCurrentMonthDailyData } from './taskHelpers';

// Helper function to add rounded rectangles
const addRoundedRect = (pdf: jsPDF, x: number, y: number, w: number, h: number, r: number = 3) => {
  // Validate coordinates
  if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h) || !isFinite(r)) {
    console.warn('Invalid coordinates for rounded rectangle:', { x, y, w, h, r });
    return;
  }
  
  if (w <= 0 || h <= 0) {
    console.warn('Invalid dimensions for rounded rectangle:', { w, h });
    return;
  }
  
  try {
    pdf.roundedRect(x, y, w, h, r, r, 'F');
  } catch (error) {
    console.warn('Error drawing rounded rectangle:', error, { x, y, w, h, r });
    // Fallback to regular rectangle
    try {
      pdf.rect(x, y, w, h, 'F');
    } catch (fallbackError) {
      console.warn('Fallback rectangle also failed:', fallbackError);
    }
  }
};

// Function to draw the line chart
export const drawLineChart = (pdf: jsPDF, x: number, y: number, width: number, height: number, data: any[]) => {
  const chartPadding = 8;
  const chartX = x + chartPadding;
  const chartY = y + chartPadding;
  const chartWidth = width - (chartPadding * 2);
  const chartHeight = height - (chartPadding * 2) - 15; // Space for labels
  
  // Background
  pdf.setFillColor(249, 250, 251);
  addRoundedRect(pdf, x, y, width, height, 4);
  
  // Chart area background
  pdf.setFillColor(255, 255, 255);
  addRoundedRect(pdf, chartX, chartY, chartWidth, chartHeight, 2);
  
  if (data.length === 0) return;
  
  // Process data to extract day numbers and completion counts
  const chartData = data.map((item, index) => ({
    day: item.day ? parseInt(item.day) : (index + 1), // Extract day number or use index
    completed: item.completed || 0
  })).filter(item => !isNaN(item.day) && item.day > 0);
  
  if (chartData.length === 0) return;
  
  const maxCompleted = Math.max(...chartData.map(d => d.completed), 1);
  const maxDay = Math.max(...chartData.map(d => d.day), 31);
  const minDay = Math.min(...chartData.map(d => d.day), 1);
  
  // Draw subtle horizontal grid lines only
  if (chartWidth > 0 && chartHeight > 0 && maxCompleted > 1) {
    pdf.setDrawColor(245, 245, 245);
    pdf.setLineWidth(0.2);
    
    // Only draw 3 horizontal grid lines for cleaner look
    for (let i = 1; i <= 3; i++) {
      const gridY = chartY + (chartHeight / 4) * i;
      if (gridY >= chartY && gridY <= chartY + chartHeight) {
        pdf.line(chartX, gridY, chartX + chartWidth, gridY);
      }
    }
  }
  
  // Draw simple line chart without connecting to edges
  if (chartData.length > 0 && chartWidth > 0 && chartHeight > 0 && maxDay > 0 && maxCompleted > 0) {
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(1.5);
    
    // Sort data by day to ensure proper line connections
    chartData.sort((a, b) => a.day - b.day);
    
    // Draw line segments between consecutive data points
    for (let i = 0; i < chartData.length - 1; i++) {
      const currentPoint = chartData[i];
      const nextPoint = chartData[i + 1];
      
      const x1 = chartX + (chartWidth / (maxDay - minDay + 1)) * (currentPoint.day - minDay);
      const y1 = chartY + chartHeight - (chartHeight / maxCompleted) * currentPoint.completed;
      const x2 = chartX + (chartWidth / (maxDay - minDay + 1)) * (nextPoint.day - minDay);
      const y2 = chartY + chartHeight - (chartHeight / maxCompleted) * nextPoint.completed;
      
      // Validate coordinates before drawing
      if (isFinite(x1) && isFinite(y1) && isFinite(x2) && isFinite(y2) &&
          x1 >= chartX && y1 >= chartY && x2 >= chartX && y2 >= chartY &&
          x1 <= chartX + chartWidth && y1 <= chartY + chartHeight &&
          x2 <= chartX + chartWidth && y2 <= chartY + chartHeight) {
        try {
          pdf.line(x1, y1, x2, y2);
        } catch (error) {
          console.log('Skipping invalid line coordinates:', {x1, y1, x2, y2});
        }
      }
    }
  }
  
  // Draw data points as small circles
  if (chartData.length > 0 && chartWidth > 0 && chartHeight > 0 && maxDay > 0 && maxCompleted > 0) {
    pdf.setFillColor(59, 130, 246);
    
    chartData.forEach(point => {
      const pointX = chartX + (chartWidth / (maxDay - minDay + 1)) * (point.day - minDay);
      const pointY = chartY + chartHeight - (chartHeight / maxCompleted) * point.completed;
      
      // Validate coordinates before drawing circle
      if (isFinite(pointX) && isFinite(pointY) && 
          pointX >= chartX && pointX <= chartX + chartWidth &&
          pointY >= chartY && pointY <= chartY + chartHeight) {
        try {
          pdf.circle(pointX, pointY, 1.2, 'F');
        } catch (error) {
          console.log('Skipping invalid circle coordinates:', {pointX, pointY});
        }
      }
    });
  }
  
  // Y-axis labels (simplified)
  if (maxCompleted > 0) {
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setCharSpace(0.1);
    
    // Show labels for 0, middle, and max values
    const labels = [
      { value: 0, position: 4 },
      { value: Math.round(maxCompleted / 2), position: 2 },
      { value: maxCompleted, position: 0 }
    ];
    
    labels.forEach(({ value, position }) => {
      const labelY = chartY + (chartHeight / 4) * position + 1;
      if (isFinite(labelY) && labelY >= 0) {
        pdf.text(value.toString(), chartX - 3, labelY, { align: 'right' });
      }
    });
  }
  
  // X-axis labels - show select days to avoid crowding
  if (maxDay > 0) {
    const labelY = chartY + chartHeight + 8;
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    
    // Determine interval based on data range
    const dayRange = maxDay - minDay + 1;
    let interval = 1;
    if (dayRange > 20) interval = 5;
    else if (dayRange > 10) interval = 3;
    else if (dayRange > 7) interval = 2;
    
    // Show labels at appropriate intervals
    for (let day = minDay; day <= maxDay; day += interval) {
      const labelX = chartX + (chartWidth / (maxDay - minDay + 1)) * (day - minDay);
      if (isFinite(labelX) && labelX >= 0 && isFinite(labelY) && labelY >= 0) {
        pdf.text(day.toString(), labelX, labelY, { align: 'center' });
      }
    }
    
    // Always show the last day if it's not already shown
    if ((maxDay - minDay) % interval !== 0) {
      const labelX = chartX + (chartWidth / (maxDay - minDay + 1)) * (maxDay - minDay);
      if (isFinite(labelX) && labelX >= 0 && isFinite(labelY) && labelY >= 0) {
        pdf.text(maxDay.toString(), labelX, labelY, { align: 'center' });
      }
    }
  }
  
  // Simplified axis labels
  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setCharSpace(0.2);
  
  // Y-axis label
  pdf.setFontSize(7);
  const yAxisLabelY1 = chartY + 5;
  const yAxisLabelY2 = chartY + 12;
  if (isFinite(yAxisLabelY1) && yAxisLabelY1 >= 0) {
    pdf.text('TASKS', chartX - 12, yAxisLabelY1);
  }
  if (isFinite(yAxisLabelY2) && yAxisLabelY2 >= 0) {
    pdf.text('COMPLETED', chartX - 12, yAxisLabelY2);
  }
  
  // X-axis label
  pdf.setFontSize(8);
  const xAxisLabelY = chartY + chartHeight + 16;
  const xAxisLabelX = chartX + chartWidth / 2;
  if (isFinite(xAxisLabelX) && xAxisLabelX >= 0 && isFinite(xAxisLabelY) && xAxisLabelY >= 0) {
    pdf.text('DAYS OF MONTH', xAxisLabelX, xAxisLabelY, { align: 'center' });
  }
};

// Helper function to check if we need a new page
const checkPageBreak = (pdf: jsPDF, yPosition: number, neededSpace: number, pageHeight: number) => {
  if (yPosition + neededSpace > pageHeight - 30) {
    pdf.addPage();
    return 25; // Reset yPosition to top
  }
  return yPosition;
};

// Main PDF generation function
export const generatePDF = async (tasks: Task[], currentMonth: string, suggestions: any[]) => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 25;
    const currentDate = new Date();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);

    // Validate inputs
    if (!Array.isArray(tasks)) {
      throw new Error('Invalid tasks data provided');
    }
    if (!currentMonth || typeof currentMonth !== 'string') {
      throw new Error('Invalid current month provided');
    }

    // Calculate comprehensive statistics
    const analytics = generateTaskAnalytics(tasks);
    const dailyData = getCurrentMonthDailyData(tasks);
  
  const stageStats = ['stage1', 'stage2', 'stage3', 'stage4'].map(stage => ({
    stage: stage.replace('stage', 'Stage '),
    total: analytics.stageProgress[stage as keyof typeof analytics.stageProgress]?.total || 0,
    completed: analytics.stageProgress[stage as keyof typeof analytics.stageProgress]?.completed || 0,
    percentage: analytics.stageProgress[stage as keyof typeof analytics.stageProgress]?.percentage || 0
  }));

  const overallCompletion = analytics.completionRate;

  // HEADER SECTION WITH ROUNDED DESIGN
  pdf.setFillColor(59, 130, 246);
  addRoundedRect(pdf, 0, 0, pageWidth, 40);
  
  // Main title with proper spacing
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setCharSpace(1.2);
  pdf.text('WORKFLOW TRACKER REPORT', pageWidth / 2, 18, { align: 'center' });
  
  // Subtitle with italic style
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(13);
  pdf.setCharSpace(0.5);
  pdf.text('Dental Practice Excellence Report', pageWidth / 2, 26, { align: 'center' });
  
  // Date line
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setCharSpace(0.3);
  pdf.text(`${currentMonth} • Generated ${currentDate.toLocaleDateString()}`, pageWidth / 2, 33, { align: 'center' });

  yPosition = 55;

  // PERFORMANCE OVERVIEW SECTION
  pdf.setFillColor(168, 85, 247);
  addRoundedRect(pdf, margin, yPosition - 8, contentWidth, 12);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setCharSpace(0.8);
  pdf.text('PERFORMANCE OVERVIEW', pageWidth / 2, yPosition - 1, { align: 'center' });
  
  yPosition += 18;

  // Overall completion visual (simplified and smaller)
  const centerX = pageWidth / 2;
  
  // Background circle (smaller)
  pdf.setFillColor(240, 240, 240);
  pdf.circle(centerX, yPosition + 12, 14, 'F');
  
  // Progress circle (smaller)
  const progressColor = overallCompletion >= 80 ? [34, 197, 94] : overallCompletion >= 50 ? [59, 130, 246] : [251, 146, 60];
  pdf.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
  pdf.circle(centerX, yPosition + 12, 12, 'F');
  
  // Center percentage text (smaller)
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setCharSpace(0.2);
  pdf.text(`${overallCompletion}%`, centerX, yPosition + 16, { align: 'center', baseline: 'middle' });

  yPosition += 30;

  // Statistics boxes with rounded corners (smaller)
  const statsY = yPosition;
  const boxWidth = (contentWidth - 20) / 3;
  
  // Total tasks box (smaller)
  pdf.setFillColor(240, 249, 255);
  addRoundedRect(pdf, margin, statsY, boxWidth, 18);
  pdf.setTextColor(59, 130, 246);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setCharSpace(0.3);
  pdf.text('TOTAL TASKS', margin + boxWidth/2, statsY + 6, { align: 'center' });
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(`${analytics.totalCheckboxes}`, margin + boxWidth/2, statsY + 13, { align: 'center' });
  
  // Completed tasks box (smaller) 
  pdf.setFillColor(240, 253, 244);
  addRoundedRect(pdf, margin + boxWidth + 10, statsY, boxWidth, 18);
  pdf.setTextColor(34, 197, 94);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('COMPLETED', margin + boxWidth + 10 + boxWidth/2, statsY + 6, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text(`${analytics.completedCheckboxes}`, margin + boxWidth + 10 + boxWidth/2, statsY + 13, { align: 'center' });
  
  // Remaining tasks box (smaller)
  pdf.setFillColor(255, 247, 237);
  addRoundedRect(pdf, margin + 2*(boxWidth + 10), statsY, boxWidth, 18);
  pdf.setTextColor(251, 146, 60);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('REMAINING', margin + 2*(boxWidth + 10) + boxWidth/2, statsY + 6, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text(`${analytics.totalCheckboxes - analytics.completedCheckboxes}`, margin + 2*(boxWidth + 10) + boxWidth/2, statsY + 13, { align: 'center' });

  yPosition = statsY + 25;

  // Add proper spacing before stage breakdown
  yPosition += 10;

  // STAGE BREAKDOWN SECTION (Page 1)
  pdf.setFillColor(34, 197, 94);
  addRoundedRect(pdf, margin, yPosition - 8, contentWidth, 12);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setCharSpace(0.8);
  pdf.text('STAGE BREAKDOWN', pageWidth / 2, yPosition - 1, { align: 'center' });
  
  yPosition += 18;

  // Stage progress bars (compact)
  const stagesWithProgress = stageStats.filter(stage => stage.total > 0);
  
  if (stagesWithProgress.length > 0) {
    stagesWithProgress.forEach((stage) => {
      yPosition = checkPageBreak(pdf, yPosition, 12, pageHeight);
      
      // Stage name with proper formatting
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setCharSpace(0.3);
      pdf.text(stage.stage, margin + 5, yPosition);
      
      // Progress bar background with rounded corners
      pdf.setFillColor(229, 231, 235);
      addRoundedRect(pdf, margin + 45, yPosition - 4, 85, 6);
      
      // Progress bar fill
      const barWidth = (stage.percentage / 100) * 85;
      const barColor = stage.percentage >= 80 ? [34, 197, 94] : stage.percentage >= 50 ? [59, 130, 246] : [251, 146, 60];
      pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
      addRoundedRect(pdf, margin + 45, yPosition - 4, barWidth, 6);
      
      // Percentage text with proper formatting
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setCharSpace(0.2);
      pdf.text(`${stage.completed}/${stage.total} (${stage.percentage}%)`, margin + 140, yPosition);
      
      yPosition += 11;
    });
  } else {
    // Show all stages with 0% progress as placeholder
    const allStages = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'];
    
    allStages.forEach((stageName, index) => {
      yPosition = checkPageBreak(pdf, yPosition, 12, pageHeight);
      
      // Stage name with proper formatting
      pdf.setTextColor(156, 163, 175);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setCharSpace(0.3);
      pdf.text(stageName, margin + 5, yPosition);
      
      // Progress bar background with rounded corners (empty)
      pdf.setFillColor(241, 245, 249);
      addRoundedRect(pdf, margin + 45, yPosition - 4, 85, 6);
      
      // No progress fill for empty stages
      
      // Percentage text with proper formatting
      pdf.setTextColor(156, 163, 175);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setCharSpace(0.2);
      pdf.text('0/0 (0%)', margin + 140, yPosition);
      
      yPosition += 11;
    });
    
    // Add encouraging message
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setCharSpace(0.2);
    pdf.text('Start completing tasks to see your stage progress', pageWidth / 2, yPosition + 5, { align: 'center' });
    yPosition += 15;
  }

  yPosition += 15;

  // DAILY COMPLETION TREND SECTION (Page 1 - bottom)
  pdf.setFillColor(75, 85, 99);
  addRoundedRect(pdf, margin, yPosition - 8, contentWidth, 12);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setCharSpace(0.8);
  pdf.text('DAILY COMPLETION TREND', pageWidth / 2, yPosition - 1, { align: 'center' });
  
  yPosition += 18;

  // Generate and display daily completion chart
  const chartHeight = 50;
  
  // Process daily data for chart rendering
  const processedChartData = dailyData.map(dayData => ({
    day: new Date(dayData.date).getDate(), // Extract day number from date
    completed: dayData.completed || 0,
    date: dayData.date
  })).filter(item => item.day > 0 && item.day <= 31);
  
  // Check if we have meaningful data
  const hasChartData = processedChartData.length > 0 && processedChartData.some(d => d.completed > 0);
  
  if (hasChartData) {
    drawLineChart(pdf, margin + 5, yPosition, contentWidth - 10, chartHeight, processedChartData);
    yPosition += chartHeight + 5;

    // Chart summary (compact)
    const completionValues = processedChartData.map(d => d.completed || 0);
    const avgDaily = completionValues.reduce((sum, val) => sum + val, 0) / completionValues.length;
    const maxDaily = Math.max(...completionValues, 0);
    const totalDays = processedChartData.length;
    
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setCharSpace(0.2);
    pdf.text(`Average: ${avgDaily.toFixed(1)} tasks/day`, margin + 10, yPosition);
    pdf.text(`Peak: ${maxDaily} tasks/day`, margin + 70, yPosition);
    pdf.text(`Active Days: ${totalDays}`, margin + 125, yPosition);
    yPosition += 15;
  } else {
    // Show placeholder for empty chart
    pdf.setFillColor(249, 250, 251);
    addRoundedRect(pdf, margin + 5, yPosition, contentWidth - 10, chartHeight, 4);
    
    // Placeholder background
    pdf.setFillColor(255, 255, 255);
    addRoundedRect(pdf, margin + 13, yPosition + 8, contentWidth - 26, chartHeight - 16, 2);
    
    // Placeholder text
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setCharSpace(0.2);
    pdf.text('Daily Completion Chart', pageWidth / 2, yPosition + 15, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text('Complete tasks daily to see your progress trends', pageWidth / 2, yPosition + 25, { align: 'center' });
    pdf.text('Chart will populate as you build your completion history', pageWidth / 2, yPosition + 32, { align: 'center' });
    
    yPosition += chartHeight + 15;
  }

  // PAGE 2: TASK SUMMARY SECTION
  pdf.addPage();
  yPosition = 25;
  
  pdf.setFillColor(251, 146, 60);
  addRoundedRect(pdf, margin, yPosition - 8, contentWidth, 12);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setCharSpace(0.8);
  pdf.text('TASK SUMMARY', pageWidth / 2, yPosition - 1, { align: 'center' });
  
  yPosition += 18;

  // Use analytics data for comprehensive task summary (ALL TASKS)
  const displayTasks = analytics.taskProgress
    .filter(task => task.total > 0)
    .sort((a, b) => b.percentage - a.percentage); // Show ALL tasks, not limited
  
  if (displayTasks.length > 0) {
    // Headers
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.setCharSpace(0.3);
    pdf.text('TASK TYPE', margin + 5, yPosition);
    pdf.text('PROGRESS', margin + 100, yPosition);
    pdf.text('COMPLETION', margin + 140, yPosition);
    yPosition += 10;

    displayTasks.forEach((task) => {
      yPosition = checkPageBreak(pdf, yPosition, 12, pageHeight);
      
      const taskColor = task.percentage >= 80 ? [34, 197, 94] : task.percentage >= 50 ? [59, 130, 246] : [100, 116, 139];
      
      // Task name
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setCharSpace(0.2);
      const taskName = task.name.length > 30 ? task.name.substring(0, 30) + '...' : task.name;
      pdf.text(taskName, margin + 5, yPosition);
      
      // Mini progress bar with rounded corners
      pdf.setFillColor(229, 231, 235);
      addRoundedRect(pdf, margin + 100, yPosition - 3, 35, 5, 2);
      
      const miniBarWidth = (task.percentage / 100) * 35;
      pdf.setFillColor(taskColor[0], taskColor[1], taskColor[2]);
      addRoundedRect(pdf, margin + 100, yPosition - 3, miniBarWidth, 5, 2);
      
      // Completion text
      pdf.setTextColor(taskColor[0], taskColor[1], taskColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text(`${task.completed}/${task.total} (${task.percentage}%)`, margin + 140, yPosition);
      
      yPosition += 11;
    });
  } else {
    // Show placeholder when no tasks have been started
    pdf.setTextColor(156, 163, 175);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setCharSpace(0.2);
    pdf.text('No tasks completed yet', pageWidth / 2, yPosition + 20, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Start completing tasks in the checklist to see detailed progress breakdown', pageWidth / 2, yPosition + 32, { align: 'center' });
    pdf.text('Your task completion history will appear here as you make progress', pageWidth / 2, yPosition + 42, { align: 'center' });
    
    yPosition += 60;
  }

  // PAGE 3: INSIGHTS & TIPS SECTION
  pdf.addPage();
  yPosition = 25;

  pdf.setFillColor(147, 51, 234);
  addRoundedRect(pdf, margin, yPosition - 8, contentWidth, 12);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setCharSpace(0.8);
  pdf.text('INSIGHTS & TIPS', pageWidth / 2, yPosition - 1, { align: 'center' });
  
  yPosition += 18;

  if (suggestions.length > 0) {
    // Display suggestions in colored rounded boxes with intelligent color coding
    suggestions.forEach((suggestion, index) => {
      yPosition = checkPageBreak(pdf, yPosition, 35, pageHeight);
      
      // Function to detect negative/critical insights
      const isNegativeInsight = (suggestion: any) => {
        const negativeKeywords = [
          'weakest', 'underperforming', 'bottleneck', 'low completion', 'poor performance',
          'lacking', 'insufficient', 'below', 'struggling', 'challenge', 'problem',
          'improve', 'develop regular', 'building habits', 'strengthen', 'optimization'
        ];
        
        const negativeCategories = [
          'Foundation Building', 'Consistency Building', 'Workflow Optimization'
        ];
        
        const content = `${suggestion.category} ${suggestion.title} ${suggestion.description}`.toLowerCase();
        
        return negativeCategories.some(cat => suggestion.category === cat) ||
               negativeKeywords.some(keyword => content.includes(keyword));
      };
      
      // Color scheme: Red/Orange for negative, Bright varied colors for positive
      const negativeColors = [
        [239, 68, 68, 254, 242, 242],     // Red - Critical issues
        [251, 146, 60, 255, 247, 237],   // Orange - Areas for improvement
      ];
      
      const positiveColors = [
        [34, 197, 94, 240, 253, 244],    // Green - Excellence/Success
        [59, 130, 246, 240, 249, 255],   // Blue - Growth/Development  
        [168, 85, 247, 245, 243, 255],   // Purple - Innovation/Advanced
        [20, 184, 166, 240, 253, 250],   // Teal - Consistency/Stability
        [236, 72, 153, 253, 244, 255],   // Pink - Specialty/Focus
        [132, 204, 22, 247, 254, 231],   // Lime - Achievement/Progress
      ];
      
      let colorSet, colorIndex;
      
      if (isNegativeInsight(suggestion)) {
        // Use red/orange colors for negative insights
        colorSet = negativeColors;
        colorIndex = index % negativeColors.length;
      } else {
        // Use bright varied colors for positive insights
        colorSet = positiveColors;
        colorIndex = index % positiveColors.length;
      }
      
      const [textR, textG, textB, bgR, bgG, bgB] = colorSet[colorIndex];
    
    // Background box with rounded corners
    pdf.setFillColor(bgR, bgG, bgB);
    addRoundedRect(pdf, margin + 5, yPosition - 5, contentWidth - 10, 32);
    
    // Category with proper formatting
    pdf.setTextColor(textR, textG, textB);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setCharSpace(0.5);
    pdf.text(`${index + 1}. ${suggestion.category.toUpperCase()}`, margin + 10, yPosition + 2);
    
    // Title
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setCharSpace(0.3);
    pdf.text(suggestion.title, margin + 10, yPosition + 9);
    
    // Description with proper line breaks
    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setCharSpace(0.1);
    const descLines = pdf.splitTextToSize(suggestion.description, contentWidth - 30);
    pdf.text(descLines.slice(0, 2), margin + 10, yPosition + 15);
    
    // Tip with italic formatting
    pdf.setTextColor(textR, textG, textB);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    const tipText = `Tip: ${suggestion.tip}`;
    const tipLines = pdf.splitTextToSize(tipText, contentWidth - 30);
    pdf.text(tipLines.slice(0, 1), margin + 10, yPosition + 23);
      
      yPosition += 38;
    });
  } else {
    // Show placeholder when no insights are available
    pdf.setTextColor(156, 163, 175);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setCharSpace(0.2);
    pdf.text('Insights & Tips Coming Soon', pageWidth / 2, yPosition + 20, { align: 'center' });
    
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Complete more tasks to unlock personalized insights and recommendations', pageWidth / 2, yPosition + 32, { align: 'center' });
    pdf.text('Your progress will generate tailored tips for dental practice excellence', pageWidth / 2, yPosition + 42, { align: 'center' });
    
    yPosition += 60;
  }

  // FOOTER SECTION with rounded design
  const footerY = pageHeight - 25;
  pdf.setFillColor(248, 250, 252);
  addRoundedRect(pdf, 0, footerY, pageWidth, 25);
  
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setCharSpace(0.5);
  pdf.text('WORKFLOW TRACKER - DENTAL PRACTICE EXCELLENCE', pageWidth / 2, footerY + 8, { align: 'center' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setCharSpace(0.2);
  pdf.text(`Generated on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`, pageWidth / 2, footerY + 15, { align: 'center' });
  
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.text('Committed to Quality Patient Care & Professional Growth', pageWidth / 2, footerY + 20, { align: 'center' });

    return pdf;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`PDF generation failed: ${error.message || 'Unknown error'}`);
  }
};