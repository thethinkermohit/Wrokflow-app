import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Checklist } from "./components/Checklist";
import { Insights } from "./components/Insights";
import { SettingsMenu } from "./components/SettingsMenu";
import { BottomNavigation } from "./components/BottomNavigation";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { LoadingScreen } from "./components/LoadingScreen";
import { AdminHeader } from "./components/AdminHeader";
import { AppHeader } from "./components/AppHeader";
import { useAuth } from "./hooks/useAuth";
import { useAutoSave } from "./hooks/useAutoSave";
import { handleExportAndRefresh } from "./utils/pdfExport";
import { apiClient } from "./utils/supabase/client";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "checklist" | "insights"
  >("dashboard");
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [initialStage, setInitialStage] = useState<string | null>(null);

  const {
    isAuthenticated,
    currentUser,
    isLoading,
    tasks,
    setTasks,
    handleLogin,
    handleLogout,
    loadUserProgress,
  } = useAuth();

  // Handle auth errors from auto-save
  const handleAuthError = () => {
    apiClient.setSessionToken(null);
    window.location.reload(); // Simple way to reset the entire app state
  };

  // Auto-save functionality
  useAutoSave({
    tasks,
    isAuthenticated,
    currentUser,
    onAuthError: handleAuthError,
  });

  const onExportAndRefresh = () => {
    handleExportAndRefresh(tasks, loadUserProgress, setActiveTab);
  };

  const onLogout = async () => {
    await handleLogout();
    setActiveTab("dashboard");
  };

  // Show loading screen during initial auth check
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show admin dashboard for admin users
  if (currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <AdminHeader 
          userFullName={currentUser.fullName} 
          onLogout={onLogout} 
        />
        <AdminDashboard />
      </div>
    );
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
            setInitialStage(null); // Reset stage selection when going back to dashboard
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
        onLogout={onLogout}
        onExportAndRefresh={onExportAndRefresh}
      />
    </div>
  );
}