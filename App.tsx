import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { Checklist } from "./components/Checklist";
import { Insights } from "./components/Insights";
import { SettingsMenu } from "./components/SettingsMenu";
import { BottomNavigation } from "./components/BottomNavigation";
import { AppHeader } from "./components/AppHeader";
import { INITIAL_TASKS, Task } from "./components/constants/taskData";
import { handleExportAndRefresh } from "./utils/pdfExport";
import { useAutoSave } from "./hooks/useAutoSave";

console.log('🔍 App.tsx - Starting (no auth)...');

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "checklist" | "insights"
  >("dashboard");
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [initialStage, setInitialStage] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  // Load tasks from local storage on startup
  useEffect(() => {
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
  }, []);

  // Auto-save functionality
  useAutoSave({ tasks });

  // Simple refresh function for tasks
  const loadUserProgress = async () => {
    setTasks(INITIAL_TASKS);
  };

  const onExportAndRefresh = () => {
    handleExportAndRefresh(tasks, loadUserProgress, setActiveTab);
  };

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
        onLogout={() => {
          // Reset tasks to initial state and clear local storage
          setTasks(INITIAL_TASKS);
          localStorage.removeItem('workflow-tracker-tasks');
          setActiveTab("dashboard");
          console.log("App reset to initial state");
        }}
        onExportAndRefresh={onExportAndRefresh}
      />
    </div>
  );
}