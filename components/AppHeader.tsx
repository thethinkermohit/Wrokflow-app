import { ToothIcon } from "./figma/ToothIcon";

export function AppHeader() {
  return (
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
  );
}