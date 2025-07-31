import { BarChart3, Settings } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "dashboard" | "checklist" | "insights";
  onTabChange: (tab: "dashboard" | "settings") => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div 
      className="relative z-[60]"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(148, 163, 184, 0.2)'
      }}
    >
      {/* Navigation Pills Container */}
      <div className="flex justify-center p-4">
        <div className="flex bg-gray-100 rounded-2xl p-1.5 space-x-1">
          <button
            onClick={() => onTabChange("dashboard")}
            className={`relative flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all duration-300 ${
              activeTab === "dashboard" || activeTab === "insights"
                ? "text-white shadow-lg transform scale-105" 
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
            style={{
              background: activeTab === "dashboard" || activeTab === "insights"
                ? '#3b82f6'
                : 'transparent'
            }}
          >
            {/* Icon with Animation */}
            <div className={`transform transition-transform duration-200 ${
              activeTab === "dashboard" || activeTab === "insights" ? 'scale-110' : ''
            }`}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Dashboard</span>
            
            {/* Active Indicator */}
            {(activeTab === "dashboard" || activeTab === "insights") && (
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </button>
          
          <button
            onClick={() => onTabChange("settings")}
            className="relative flex flex-col items-center space-y-1 px-6 py-3 rounded-xl transition-all duration-300 text-gray-500 hover:text-gray-700 hover:bg-white/50"
          >
            {/* Icon with Animation */}
            <div className="transform transition-transform duration-200 hover:scale-110">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>
      
      {/* Subtle Glow Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(circle at 25% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)'
        }}
      ></div>
      
      {/* Safe Area for iOS */}
      <div className="h-safe-area-inset-bottom bg-transparent"></div>
    </div>
  );
}