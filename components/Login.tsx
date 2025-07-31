import { useState } from "react";
import { AlertCircle, Lock, User, Wifi } from "lucide-react";
import { apiClient } from "../utils/supabase/client";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await onLogin(username, password);

      if (!result.success) {
        setError(result.error || "Invalid username or password. Please try again.");
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setError("");
    try {
      console.log('Testing connection to server...');
      // Force refresh backend detection
      apiClient.refreshBackendDetection();
      const response = await apiClient.testConnectivity();
      const backendMode = apiClient.getBackendMode();
      console.log('Connection test response:', response);
      setError(`✅ Connection OK! Backend: ${backendMode} | Status: ${response.status}`);
    } catch (error: unknown) {
      console.error('Connection test failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`❌ Connection failed: ${errorMessage}`);
    } finally {
      setTestingConnection(false);
    }
  };

  // Custom Tooth Icon Component
  const ToothIcon = ({ className }: { className?: string }) => (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C8.5 2 6 4.5 6 8c0 2 0.5 3.8 1.2 5.3c0.3 0.7 0.8 1.4 1.3 2c0.5 0.6 1 1.2 1.2 1.9c0.2 0.7 0.3 1.4 0.3 2.1c0 1.4 1.1 2.7 2.5 2.7h0.1c1.4 0 2.5-1.3 2.5-2.7c0-0.7 0.1-1.4 0.3-2.1c0.2-0.7 0.7-1.3 1.2-1.9c0.5-0.6 1-1.3 1.3-2C17.5 11.8 18 10 18 8c0-3.5-2.5-6-6-6zm0 2c2.5 0 4 1.5 4 4c0 1.5-0.4 2.8-0.9 3.9c-0.2 0.4-0.5 0.8-0.8 1.2c-0.6 0.8-1.3 1.6-1.6 2.6c-0.1 0.3-0.2 0.6-0.2 0.9h-0.1c0-0.3-0.1-0.6-0.2-0.9c-0.3-1-1-1.8-1.6-2.6c-0.3-0.4-0.6-0.8-0.8-1.2C8.4 10.8 8 9.5 8 8c0-2.5 1.5-4 4-4z"/>
      <path d="M12 5c-1.1 0-2 0.9-2 2s0.9 2 2 2s2-0.9 2-2s-0.9-2-2-2z" opacity="0.7"/>
    </svg>
  );

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center space-y-4 mb-8">
          {/* Enhanced Tooth Logo */}
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
               style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)' }}>
            <ToothIcon className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Workflow Tracker
            </h1>
            <p className="text-gray-600 font-medium">Dental Practice Excellence</p>
            <p className="text-sm text-gray-500 mt-1">Please Sign-in</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className={`p-3 rounded-lg border ${
              error.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{ background: 'var(--input-background)' }}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{ background: 'var(--input-background)' }}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Enhanced Login Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: isLoading ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Test Connection Button */}
          <button 
            type="button" 
            disabled={testingConnection}
            onClick={testConnection}
            className="w-full py-2 px-4 rounded-lg font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wifi className="w-4 h-4" />
            {testingConnection ? "Testing..." : "Test Server Connection"}
          </button>
        </form>
      </div>
    </div>
  );
}