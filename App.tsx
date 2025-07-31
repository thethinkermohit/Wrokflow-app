import { useState, useEffect, useRef } from "react";
import { Dashboard } from "./components/Dashboard";
import { Checklist } from "./components/Checklist";
import { Insights } from "./components/Insights";
import { SettingsMenu } from "./components/SettingsMenu";
import { BottomNavigation } from "./components/BottomNavigation";
import { Login } from "./components/Login";
import { AdminDashboard } from "./components/AdminDashboard";
import { Button } from "./components/ui/button";
import { ToothIcon } from "./components/figma/ToothIcon";
import {
  LogOut,
  Shield,
} from "lucide-react";
import {
  INITIAL_TASKS,
  Task,
} from "./components/constants/taskData";
import { apiClient } from "./utils/supabase/client";


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "checklist" | "insights"
  >("dashboard");
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialStage, setInitialStage] = useState<string | null>(null);

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
            console.log(
              "Session validated successfully for user:",
              profileResponse.user.username,
            );
          } else {
            console.log(
              "Invalid profile response, clearing session",
            );
            apiClient.setSessionToken(null);
          }
        } catch (error: any) {
          console.log(
            "Session validation failed, clearing session:",
            error.message || error,
          );
          // Clear invalid/expired session silently
          apiClient.setSessionToken(null);
          // Reset to initial state
          setIsAuthenticated(false);
          setCurrentUser(null);
          setTasks(INITIAL_TASKS);
        }
      } else {
        console.log("No session token found, showing login");
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
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
        console.log("Loaded user progress from server");
      } else {
        console.log(
          "No saved progress found, using default tasks",
        );
        setTasks(INITIAL_TASKS);
      }
    } catch (error: any) {
      console.log(
        "Could not load user progress:",
        error.message || error,
      );
      // If there's an error loading progress, continue with default tasks
      setTasks(INITIAL_TASKS);

      // If it's an auth error, clear the session
      if (
        error.message &&
        (error.message.includes("Invalid") ||
          error.message.includes("expired"))
      ) {
        console.log(
          "Progress loading failed due to session issue, clearing session",
        );
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
        console.log("Progress auto-saved");
      } catch (error: any) {
        console.log(
          "Error auto-saving progress:",
          error.message || error,
        );

        // If it's an auth error, clear the session
        if (
          error.message &&
          (error.message.includes("Invalid") ||
            error.message.includes("expired"))
        ) {
          console.log(
            "Auto-save failed due to session issue, clearing session",
          );
          apiClient.setSessionToken(null);
          setIsAuthenticated(false);
          setCurrentUser(null);
          setTasks(INITIAL_TASKS);
        }
      }
    }, 2000); // Save after 2 seconds of no changes

    return () => clearTimeout(saveProgressDebounced);
  }, [tasks, isAuthenticated, currentUser]);



  const handleLogin = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.login(
        username,
        password,
      );

      if (
        response &&
        response.success &&
        response.sessionToken &&
        response.user
      ) {
        apiClient.setSessionToken(response.sessionToken);
        setIsAuthenticated(true);
        setCurrentUser(response.user);

        console.log(
          "Login successful for user:",
          response.user.username,
        );

        // Load user's progress after login
        await loadUserProgress();

        return { success: true };
      }

      const errorMessage =
        response?.error || "Invalid username or password";
      console.log("Login failed:", errorMessage);
      return { success: false, error: errorMessage };
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.message ||
        "Login failed. Please check your connection and try again.";
      return { success: false, error: errorMessage };
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out user...");

      // Try to save progress before logout (but don't block logout if it fails)
      try {
        if (isAuthenticated && currentUser) {
          await apiClient.saveProgress(tasks);
          console.log("Progress saved before logout");
        }
      } catch (saveError) {
        console.log(
          "Could not save progress before logout:",
          saveError,
        );
      }

      // Notify server of logout (but don't block logout if it fails)
      try {
        await apiClient.logout();
        console.log("Server logout successful");
      } catch (logoutError) {
        console.log("Server logout failed:", logoutError);
      }
    } catch (error) {
      console.log("Logout process encountered errors:", error);
    } finally {
      // Always clean up local state regardless of server communication
      setIsAuthenticated(false);
      setCurrentUser(null);
      setTasks(INITIAL_TASKS);
      apiClient.setSessionToken(null);
      setActiveTab("dashboard");
      console.log("Local logout completed");
    }
  };

  const handleExportAndRefresh = async () => {
    try {
      console.log("Starting export and refresh process...");
      
      // Step 1: Generate and save PDF report
      try {
        const { generatePDF } = await import('./components/utils/pdfGenerator');
        const { generateDentalSuggestions } = await import('./components/utils/dentalSuggestions');
        
        const safeTasks = Array.isArray(tasks) ? tasks : [];
        const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const suggestions = generateDentalSuggestions(safeTasks);
        
        console.log("Generating PDF report...");
        const pdf = await generatePDF(safeTasks, currentMonth, suggestions);
        
        // Save the PDF
        pdf.save(`Workflow-Tracker-Report-${currentMonth.replace(' ', '-')}.pdf`);
        console.log("PDF report generated and saved successfully");
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        alert("Warning: Could not generate PDF report, but continuing with data refresh...");
      }
      
      // Step 2: Refresh data from server (no need to save since auto-save is already active)
      await loadUserProgress();
      console.log("Data refreshed from server successfully");
      
      // Step 3: Navigate back to dashboard
      setActiveTab("dashboard");
      
      alert("PDF report saved and data refreshed successfully!");
    } catch (error: any) {
      console.error("Error during export and refresh:", error);
      alert("Error during export and refresh. Please try again.");
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
      <div className="min-h-screen bg-white">
        {/* Admin Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Workflow Tracker Admin
                </h1>
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
      style={{ background: "var(--background)" }}
    >
      {/* Enhanced Header with Medical Theme */}
      <div
        className="flex-shrink-0 px-4 py-3 flex justify-center items-center relative overflow-hidden z-[100]"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
        }}
      >
        <div className="flex items-center gap-3 relative z-10">
          {/* Professional Dental Tooth Icon */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
            <ToothIcon className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Workflow Tracker
            </h1>
            <div className="text-xs text-gray-500 font-medium">
              Dental Practice Excellence
            </div>
          </div>
        </div>
      </div>

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
        onLogout={handleLogout}
        onExportAndRefresh={handleExportAndRefresh}
      />
    </div>
  );
}