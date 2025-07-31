import { ArrowLeft, TrendingUp, Calendar, Target, Clock, Award, Brain, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Task } from "./constants/taskData";
import { generateTaskAnalytics, getCurrentMonthDailyData } from "./utils/taskHelpers";
import { generateRealInsights } from "./utils/insightsHelpers";

interface InsightsProps {
  tasks: Task[];
  onBackClick: () => void;
}

// Icon mapping for insights
const iconMap = {
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Target: <Target className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />
};

export function Insights({ tasks, onBackClick }: InsightsProps) {
  // Generate comprehensive analytics from real task data
  const analytics = generateTaskAnalytics(tasks);
  const dailyData = getCurrentMonthDailyData(tasks);
  const hasRealData = analytics.completedCheckboxes >= 5; // Need at least 5 completed checkboxes for insights
  
  // Only use real data when available, no sample data fallback
  const chartData = hasRealData ? dailyData.map(day => ({
    day: new Date(day.date).getDate().toString(),
    tasks: day.completed,
    dayName: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
  })) : [];
  
  const insights = hasRealData ? generateRealInsights(analytics, dailyData) : [];
  const totalTasks = hasRealData ? analytics.completedCheckboxes : 0;
  const avgDaily = hasRealData ? (analytics.dailyData.length > 0 ? Math.round(analytics.completedCheckboxes / (analytics.insights?.totalWorkingDays || 1)) : 0) : 0;
  const _bestDay = hasRealData ? (analytics.insights?.mostProductiveDay ? { day: new Date(analytics.insights.mostProductiveDay).getDate(), tasks: Math.max(...dailyData.map(d => d.completed)) } : { tasks: 0 }) : { tasks: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBackClick}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Insights</h1>
          <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Performance Analysis</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
            <div className="text-xs text-gray-600 font-medium">{hasRealData ? "Total Completed" : "Tasks Completed"}</div>
          </div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{avgDaily}</div>
            <div className="text-xs text-gray-600 font-medium">Daily Average</div>
          </div>
        </Card>
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{hasRealData ? analytics.completionRate : 0}</div>
            <div className="text-xs text-gray-600 font-medium">{hasRealData ? "Completion %" : "Completion %"}</div>
          </div>
        </Card>
      </div>

      {/* Bar Chart or Placeholder */}
      <Card className="p-6 mb-6 bg-white/80 backdrop-blur-sm border-slate-200">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Daily Task Completion</h2>
          <p className="text-sm text-gray-600">
            {hasRealData ? `Tasks completed each day in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` 
             : "Complete more tasks to see your progress trends"}
          </p>
        </div>
        {hasRealData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  formatter={(value: any, _name: any) => [`${value} tasks`, 'Completed']}
                  labelFormatter={(label: any) => `${new Date().toLocaleDateString('en-US', { month: 'long' })} ${label}, ${new Date().getFullYear()}`}
                />
                <Bar 
                  dataKey="tasks" 
                  fill="url(#gradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Chart Data Yet</h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                Complete at least 5 tasks to unlock detailed analytics and insights about your productivity patterns.
              </p>
              <div className="mt-4 text-xs text-gray-500">
                Current progress: {analytics.completedCheckboxes} of 5 tasks needed
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Smart Insights or Placeholder */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Smart Insights</h2>
        {hasRealData ? (
          insights.map((insight, index) => (
            <Card key={index} className="p-4 bg-white/80 backdrop-blur-sm border-slate-200">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${insight.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <div className={insight.color}>
                    {iconMap[insight.icon as keyof typeof iconMap] || <Brain className="w-5 h-5" />}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="space-y-3">
            {/* Placeholder insights showing what will be available */}
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-200 border-dashed">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-400 mb-1">Weekly Productivity Patterns</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Discover which days you're most productive and optimize your schedule</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-200 border-dashed">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-400 mb-1">Peak Performance Analysis</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Identify your best performing days and tasks completion trends</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-200 border-dashed">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-400 mb-1">Behavioral Insights</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Get personalized recommendations based on your work patterns</p>
                </div>
              </div>
            </Card>
            
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">Unlock Smart Insights</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto mb-3">
                Complete more tasks to unlock AI-powered insights about your productivity patterns and get personalized recommendations.
              </p>
              <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                {Math.max(0, 5 - analytics.completedCheckboxes)} more tasks needed
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Behavioral Insights or Motivation */}
      {hasRealData ? (
        <Card className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Productivity Insight</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {(analytics.insights?.streakCount || 0) > 0 
                ? `Your ${analytics.insights?.streakCount || 0}-day streak shows excellent consistency. Keep building this momentum for optimal skill development.`
                : `You've completed ${analytics.completionRate}% of your workflow. Consistent daily practice leads to exceptional patient care skills.`
              }
            </p>
          </div>
        </Card>
      ) : (
        <Card className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-blue-500 flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Start Your Journey</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Begin completing tasks in your workflow stages to unlock powerful analytics. 
              Track your progress, identify patterns, and optimize your dental practice efficiency with data-driven insights.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}