import { useState, useEffect } from "react";
import { apiClient } from "../utils/supabase";

interface DatabaseHealthProps {
  className?: string;
}

export function DatabaseHealth({ className = "" }: DatabaseHealthProps) {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "local" | "error">("checking");
  const [backendMode, setBackendMode] = useState<string>("");

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus("checking");
      
      // Check if apiClient exists and has the required methods
      if (!apiClient) {
        console.error("API Client not available");
        setConnectionStatus("error");
        setBackendMode("API Client not available");
        return;
      }

      if (typeof apiClient.testConnectivity !== 'function') {
        console.error("API Client testConnectivity method not available");
        setConnectionStatus("error");
        setBackendMode("API Client methods not available");
        return;
      }

      // Refresh backend detection if method exists
      if (typeof apiClient.refreshBackendDetection === 'function') {
        apiClient.refreshBackendDetection();
      }

      // Test connectivity
      await apiClient.testConnectivity();
      
      // Get backend mode if method exists
      if (typeof apiClient.getBackendMode === 'function') {
        const mode = apiClient.getBackendMode();
        setBackendMode(mode);
        setConnectionStatus(mode === "Local Storage" ? "local" : "connected");
      } else {
        setConnectionStatus("connected");
        setBackendMode("Unknown");
      }

      console.log("✅ Connection test successful");
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionStatus("error");
      setBackendMode("Connection failed");
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected": return "text-green-600";
      case "local": return "text-blue-600";
      case "error": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "checking": return "Checking connection...";
      case "connected": return "Server Connected";
      case "local": return "Local Storage Mode";
      case "error": return "Connection Failed";
      default: return "Unknown";
    }
  };

  return (
    <div className={`p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === "connected" ? "bg-green-500" :
            connectionStatus === "local" ? "bg-blue-500" :
            connectionStatus === "error" ? "bg-red-500" : "bg-gray-400"
          }`} />
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <button
          onClick={checkConnection}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          disabled={connectionStatus === "checking"}
        >
          Refresh
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Backend: {backendMode}
      </div>
    </div>
  );
}