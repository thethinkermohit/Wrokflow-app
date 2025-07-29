import { useState, useEffect, useRef } from "react";
import { Dashboard } from "./components/Dashboard";
import { Checklist } from "./components/Checklist";
import { BottomNavigation } from "./components/BottomNavigation";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { Button } from "./components/ui/button";
import { LogOut, Settings, Download, RefreshCw, RotateCcw, User, Shield } from "lucide-react";
import { INITIAL_TASKS, Task } from "./components/constants/taskData";
import { apiClient } from "./utils/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "checklist">("dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionToken = apiClient.getSessionToken();
      
      if (sessionToken) {
        // Validate session with server
        try {
          const profileResponse = await apiClient.getProfile();
          
          if (profileResponse && profileResponse.user) {
            setIsAuthenticated(true);
            setCurrentUser(profileResponse.user);
            
            // Load user's progress
            await loadUserProgress();
            console.log('Session validated successfully for user:', profileResponse.user.username);
          } else {
            console.log('Invalid profile response, clearing session');
            apiClient.setSessionToken(null);
          }
        } catch (error: any) {
          console.log('Session validation failed, clearing session:', error.message || error);
          // Clear invalid/expired session silently
          apiClient.setSessionToken(null);
          // Reset to initial state
          setIsAuthenticated(false);
          setCurrentUser(null);
          setTasks(INITIAL_TASKS);
        }
      } else {
        console.log('No session token found, showing login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Ensure clean state on any error
      apiClient.setSessionToken(null);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setTasks(INITIAL_TASKS);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const response = await apiClient.loadProgress();
      if (response && response.tasks) {
        setTasks(response.tasks);
        console.log('Loaded user progress from server');
      } else {
        console.log('No saved progress found, using default tasks');
        setTasks(INITIAL_TASKS);
      }
    } catch (error: any) {
      console.log('Could not load user progress:', error.message || error);
      // If there's an error loading progress, continue with default tasks
      setTasks(INITIAL_TASKS);
      
      // If it's an auth error, clear the session
      if (error.message && (error.message.includes('Invalid') || error.message.includes('expired'))) {
        console.log('Progress loading failed due to session issue, clearing session');
        apiClient.setSessionToken(null);
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    }
  };

  // Auto-save progress when tasks change (debounced)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const saveProgressDebounced = setTimeout(async () => {
      try {
        await apiClient.saveProgress(tasks);
        console.log('Progress auto-saved');
      } catch (error: any) {
        console.log('Error auto-saving progress:', error.message || error);
        
        // If it's an auth error, clear the session
        if (error.message && (error.message.includes('Invalid') || error.message.includes('expired'))) {
          console.log('Auto-save failed due to session issue, clearing session');
          apiClient.setSessionToken(null);
          setIsAuthenticated(false);
          setCurrentUser(null);
          setTasks(INITIAL_TASKS);
        }
      }
    }, 2000); // Save after 2 seconds of no changes

    return () => clearTimeout(saveProgressDebounced);
  }, [tasks, isAuthenticated, currentUser]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogin = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.login(username, password);

      if (response && response.success && response.sessionToken && response.user) {
        apiClient.setSessionToken(response.sessionToken);
        setIsAuthenticated(true);
        setCurrentUser(response.user);
        
        console.log('Login successful for user:', response.user.username);
        
        // Load user's progress after login
        await loadUserProgress();
        
        return { success: true };
      }

      const errorMessage = response?.error || "Invalid username or password";
      console.log('Login failed:', errorMessage);
      return { success: false, error: errorMessage };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || "Login failed. Please check your connection and try again.";
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      
      // Try to save progress before logout (but don't block logout if it fails)
      try {
        if (isAuthenticated && currentUser) {
          await apiClient.saveProgress(tasks);
          console.log('Progress saved before logout');
        }
      } catch (saveError) {
        console.log('Could not save progress before logout:', saveError);
      }
      
      // Notify server of logout (but don't block logout if it fails)
      try {
        await apiClient.logout();
        console.log('Server logout successful');
      } catch (logoutError) {
        console.log('Server logout failed:', logoutError);
      }
      
    } catch (error) {
      console.log('Logout process encountered errors:', error);
    } finally {
      // Always clean up local state regardless of server communication
      setIsAuthenticated(false);
      setCurrentUser(null);
      setTasks(INITIAL_TASKS);
      apiClient.setSessionToken(null);
      setShowUserMenu(false);
      setActiveTab("dashboard");
      console.log('Local logout completed');
    }
  };

  const generateProgressReport = (tasks: Task[]) => {
    const stages = ['stage1', 'stage2', 'stage3', 'stage4'];
    const stageNames = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'];
    
    // Create a hidden div with the progress report
    const reportDiv = document.createElement('div');
    reportDiv.style.position = 'absolute';
    reportDiv.style.left = '-9999px';
    reportDiv.style.top = '0';
    reportDiv.style.width = '800px';
    reportDiv.style.padding = '40px';
    reportDiv.style.backgroundColor = 'white';
    reportDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Get current date for the report
    const now = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();
    
    let htmlContent = `
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #1f2937; margin-bottom: 10px; font-size: 28px;">Workflow Tracker Progress Report</h1>
        <p style="color: #6b7280; font-size: 16px; margin: 0;">${currentMonth} ${currentYear}</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
      </div>
    `;
    
    stages.forEach((stage, stageIndex) => {
      const stageName = stageNames[stageIndex];
      htmlContent += `<div style="margin-bottom: 30px;">`;
      htmlContent += `<h2 style="color: #374151; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 16px; font-size: 20px;">${stageName}</h2>`;
      
      const stageTasks = tasks.filter(task => task.stages[stage as keyof typeof task.stages]);
      let stageCompleted = 0;
      let stageTotal = 0;
      
      if (stageTasks.length === 0) {
        htmlContent += `<p style="color: #6b7280; font-style: italic; margin: 0;">No tasks for this stage</p>`;
      } else {
        htmlContent += `<div style="display: grid; gap: 12px;">`;
        
        stageTasks.forEach(task => {
          const stageData = task.stages[stage as keyof typeof task.stages];
          if (stageData) {
            const completed = stageData.filter(checkbox => checkbox.completed).length;
            const total = stageData.length;
            stageCompleted += completed;
            stageTotal += total;
            
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isFullyCompleted = completed === total;
            
            htmlContent += `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background-color: ${isFullyCompleted ? '#f0fdf4' : '#ffffff'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h3 style="margin: 0; font-size: 16px; color: #1f2937; font-weight: 600;">${task.name}</h3>
                  <span style="background-color: ${isFullyCompleted ? '#22c55e' : '#3b82f6'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${percentage}%</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="flex: 1; background-color: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; background-color: ${isFullyCompleted ? '#22c55e' : '#3b82f6'}; width: ${percentage}%; transition: width 0.3s ease;"></div>
                  </div>
                  <span style="font-size: 14px; color: #6b7280; font-weight: 500;">${completed}/${total}</span>
                </div>
              </div>
            `;
          }
        });
        
        htmlContent += `</div>`;
        
        // Stage summary
        const stagePercentage = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;
        htmlContent += `
          <div style="margin-top: 16px; padding: 12px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; font-weight: 600; color: #1f2937;">Stage Summary: ${stageCompleted}/${stageTotal} tasks completed (${stagePercentage}%)</p>
          </div>
        `;
      }
      
      htmlContent += `</div>`;
    });
    
    // Overall summary
    const totalCompleted = tasks.reduce((acc, task) => {
      return acc + Object.values(task.stages).reduce((stageAcc, stage) => {
        return stageAcc + stage.filter(checkbox => checkbox.completed).length;
      }, 0);
    }, 0);
    
    const totalTasks = tasks.reduce((acc, task) => {
      return acc + Object.values(task.stages).reduce((stageAcc, stage) => {
        return stageAcc + stage.length;
      }, 0);
    }, 0);
    
    const overallPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    
    htmlContent += `
      <div style="margin-top: 40px; padding: 20px; background-color: #1f2937; color: white; border-radius: 12px; text-align: center;">
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">Overall Progress</h2>
        <p style="margin: 0; font-size: 18px; font-weight: 600;">${totalCompleted}/${totalTasks} tasks completed</p>
        <p style="margin: 8px 0 0 0; font-size: 32px; font-weight: bold; color: #3b82f6;">${overallPercentage}%</p>
      </div>
      
      <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}</p>
      </div>
    `;
    
    reportDiv.innerHTML = htmlContent;
    document.body.appendChild(reportDiv);
    
    return { reportDiv, fileName: `${currentMonth}_${currentYear}_WorkflowTracker_Progress` };
  };

  const handleSaveAndRefresh = async () => {
    if (isGeneratingReport) return;
    
    setIsGeneratingReport(true);
    
    try {
      // Generate the progress report
      const { reportDiv, fileName } = generateProgressReport(tasks);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Convert to canvas with improved compatibility
      const canvas = await html2canvas(reportDiv, {
        width: 800,
        height: reportDiv.scrollHeight,
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          // Ensure all styles are explicitly set for PDF generation
          const styles = clonedDoc.createElement('style');
          styles.textContent = `
            * { 
              box-sizing: border-box !important; 
              -webkit-print-color-adjust: exact !important; 
              color-adjust: exact !important; 
            }
            body { 
              font-family: Arial, sans-serif !important; 
              background: white !important; 
            }
          `;
          clonedDoc.head.appendChild(styles);
        }
      });
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Handle multi-page PDFs if content is too long
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`${fileName}.pdf`);
      
      // Clean up
      document.body.removeChild(reportDiv);
      
      // Reset all tasks
      const resetTasks = INITIAL_TASKS.map(task => ({
        ...task,
        stages: {
          stage1: task.stages.stage1.map(checkbox => ({ ...checkbox, completed: false })),
          stage2: task.stages.stage2.map(checkbox => ({ ...checkbox, completed: false })),
          stage3: task.stages.stage3.map(checkbox => ({ ...checkbox, completed: false })),
          stage4: task.stages.stage4.map(checkbox => ({ ...checkbox, completed: false }))
        }
      }));
      
      setTasks(resetTasks);
      
      // Save reset state to server
      try {
        await apiClient.resetProgress();
        console.log('Progress reset on server');
      } catch (error) {
        console.error('Error resetting progress on server:', error);
      }
      
      // Reset active tab to dashboard
      setActiveTab("dashboard");
      
      // Close menu
      setShowUserMenu(false);
      
      // Show success message
      alert(`Progress saved as ${fileName}.pdf and all tasks have been reset!`);
      
    } catch (error: any) {
      console.error('Error generating report:', error);
      
      // Provide specific error message for color parsing issues
      let errorMessage = 'Error generating progress report. Please try again.';
      if (error.message && error.message.includes('color function')) {
        errorMessage = 'PDF generation failed due to unsupported color formats. The issue has been logged for fixing.';
      } else if (error.message && error.message.includes('oklch')) {
        errorMessage = 'Color format error detected. Please refresh the page and try again.';
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRefresh = async () => {
    const confirmRefresh = window.confirm(
      "Are you sure you want to reset all progress? This action cannot be undone and will uncheck all completed tasks."
    );
    
    if (confirmRefresh) {
      // Reset all tasks
      const resetTasks = INITIAL_TASKS.map(task => ({
        ...task,
        stages: {
          stage1: task.stages.stage1.map(checkbox => ({ ...checkbox, completed: false })),
          stage2: task.stages.stage2.map(checkbox => ({ ...checkbox, completed: false })),
          stage3: task.stages.stage3.map(checkbox => ({ ...checkbox, completed: false })),
          stage4: task.stages.stage4.map(checkbox => ({ ...checkbox, completed: false }))
        }
      }));
      
      setTasks(resetTasks);
      
      // Reset progress on server
      try {
        await apiClient.resetProgress();
        console.log('Progress reset on server');
      } catch (error) {
        console.error('Error resetting progress on server:', error);
      }
      
      // Reset active tab to dashboard
      setActiveTab("dashboard");
      
      // Close menu
      setShowUserMenu(false);
      
      // Show success message
      alert("All progress has been reset! Starting fresh.");
    }
  };

  // Show loading screen during initial auth check
  if (isLoading) {
    return (
      <div className="h-screen max-w-md mx-auto bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show admin dashboard for admin users
  if (currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Workflow Tracker Admin</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Welcome, {currentUser.fullName}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div 
      className="h-screen max-w-md mx-auto flex flex-col overflow-hidden relative shadow-2xl"
      style={{ background: 'var(--background)' }}
    >
      {/* Enhanced Header with Medical Theme */}
      <div 
        className="flex-shrink-0 px-4 py-3 flex justify-between items-center relative overflow-hidden z-[100]"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600"></div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          {/* Tooth Logo/Icon */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.5 2 6 4.5 6 8c0 2 0.5 3.8 1.2 5.3c0.3 0.7 0.8 1.4 1.3 2c0.5 0.6 1 1.2 1.2 1.9c0.2 0.7 0.3 1.4 0.3 2.1c0 1.4 1.1 2.7 2.5 2.7h0.1c1.4 0 2.5-1.3 2.5-2.7c0-0.7 0.1-1.4 0.3-2.1c0.2-0.7 0.7-1.3 1.2-1.9c0.5-0.6 1-1.3 1.3-2C17.5 11.8 18 10 18 8c0-3.5-2.5-6-6-6zm0 2c2.5 0 4 1.5 4 4c0 1.5-0.4 2.8-0.9 3.9c-0.2 0.4-0.5 0.8-0.8 1.2c-0.6 0.8-1.3 1.6-1.6 2.6c-0.1 0.3-0.2 0.6-0.2 0.9h-0.1c0-0.3-0.1-0.6-0.2-0.9c-0.3-1-1-1.8-1.6-2.6c-0.3-0.4-0.6-0.8-0.8-1.2C8.4 10.8 8 9.5 8 8c0-2.5 1.5-4 4-4z"/>
              <path d="M12 5c-1.1 0-2 0.9-2 2s0.9 2 2 2s2-0.9 2-2s-0.9-2-2-2z" opacity="0.7"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Workflow Tracker
            </h1>
            <div className="text-xs text-gray-500 font-medium">Dental Practice Excellence</div>
          </div>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="relative p-2 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-200 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md group"
          >
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            
            {/* Notification Dot */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </button>
          
          {showUserMenu && (
            <div className="settings-dropdown">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {currentUser?.fullName || currentUser?.username || 'User'}
                </p>
              </div>
              <button
                onClick={handleSaveAndRefresh}
                disabled={isGeneratingReport}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 border-b border-gray-100 ${
                  isGeneratingReport 
                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <RefreshCw className={`w-3 h-3 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                </div>
                {isGeneratingReport ? 'Generating...' : 'Save & Refresh'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={isGeneratingReport}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 border-b border-gray-100 ${
                  isGeneratingReport 
                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                    : 'text-orange-600 hover:bg-orange-50'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" ? (
          <Dashboard tasks={tasks} />
        ) : (
          <Checklist tasks={tasks} setTasks={setTasks} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}