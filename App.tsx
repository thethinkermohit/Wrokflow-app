import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { Checklist } from "./components/Checklist";
import { Insights } from "./components/Insights";
import { SettingsMenu } from "./components/SettingsMenu";
import { BottomNavigation } from "./components/BottomNavigation";
import { AppHeader } from "./components/AppHeader";
import { LoginPage } from "./components/LoginPage";
import { INITIAL_TASKS, Task } from "./components/constants/taskData";
import { handleExportAndRefresh } from "./utils/pdfExport";
import { useAutoSave } from "./hooks/useAutoSave";

console.log('🔍 App.tsx - Starting (password protected)...');

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "checklist" | "insights"
  >("dashboard");
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [initialStage, setInitialStage] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on startup
  useEffect(() => {
    try {
      const authState = localStorage.getItem('workflow-tracker-auth');
      if (authState === 'authenticated') {
        setIsAuthenticated(true);
        console.log("User already authenticated");
      }
    } catch (error) {
      console.error("Error checking authentication state:", error);
    }
    
    setIsLoading(false);
  }, []);

  // Load tasks from local storage on startup
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const savedTasks = localStorage.getItem('workflow-tracker-tasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
            setTasks(parsedTasks);
            console.log("Loaded tasks from local storage");
          }
        }
      } catch (error) {
        console.error("Error loading tasks from local storage:", error);
      }
    }
  }, [isAuthenticated]);

  // Auto-save functionality
  useAutoSave({ tasks });

  // Handle successful authentication
  const handleLogin = () => {
    setIsAuthenticated(true);
    console.log("User authenticated successfully");
  };

  // Handle logout
  const handleLogout = () => {
    // Reset tasks to initial state and clear all storage
    setTasks(INITIAL_TASKS);
    localStorage.removeItem('workflow-tracker-tasks');
    localStorage.removeItem('workflow-tracker-auth');
    setIsAuthenticated(false);
    setActiveTab("dashboard");
    console.log("User logged out and app reset to initial state");
  };

  // Simple refresh function for tasks
  const loadUserProgress = async () => {
    setTasks(INITIAL_TASKS);
  };

  const onExportAndRefresh = () => {
    handleExportAndRefresh(tasks, loadUserProgress, setActiveTab);
  };

  // Show loading screen briefly
  if (isLoading) {
    return (
      <div className="h-screen max-w-md mx-auto flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-gray-600">Loading Workflow Tracker...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div
      className="h-screen max-w-md mx-auto flex flex-col overflow-hidden relative shadow-2xl"
      style={{ background: "var(--background)" }}
    >
      {/* Enhanced Header with Medical Theme */}
      <AppHeader />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "dashboard" ? (
          <Dashboard 
            tasks={tasks} 
            onStageClick={(stage) => {
              setInitialStage(stage);
              setActiveTab("checklist");
            }}
            onInsightsClick={() => setActiveTab("insights")}
          />
        ) : activeTab === "checklist" ? (
          <Checklist 
            tasks={tasks} 
            setTasks={setTasks} 
            initialStage={initialStage}
            onStageChange={() => setInitialStage(null)}
          />
        ) : (
          <Insights 
            tasks={tasks}
            onBackClick={() => setActiveTab("dashboard")}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "dashboard") {
            setActiveTab(tab);
            setInitialStage(null);
          } else if (tab === "settings") {
            setIsSettingsMenuOpen(true);
          }
        }}
      />

      {/* Settings Menu */}
      <SettingsMenu
        tasks={tasks}
        isOpen={isSettingsMenuOpen}
        onClose={() => setIsSettingsMenuOpen(false)}
        onLogout={handleLogout}
        onExportAndRefresh={onExportAndRefresh}
      />
    </div>
  );
}