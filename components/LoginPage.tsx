import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock, Stethoscope, Eye, EyeOff } from "lucide-react";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const CORRECT_PASSWORD = "Excelsior";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!password.trim()) {
      setError("Please enter the access password");
      return;
    }

    setIsLoading(true);
    
    // Simulate a brief loading period for better UX
    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        // Store authentication state in localStorage
        localStorage.setItem('workflow-tracker-auth', 'authenticated');
        onLogin();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
      setIsLoading(false);
    }, 800);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workflow Tracker</h1>
          <p className="text-gray-600">Dental Practice Management System</p>
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            Secure Access Required
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Enter Access Password</h2>
              <p className="text-sm text-gray-600">Please enter the password to access the system</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password *
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter password"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {error}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Access System
                </div>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                📊 Track progress across 4 stages
              </p>
              <p className="text-sm text-gray-600 mb-2">
                📈 View detailed insights and analytics
              </p>
              <p className="text-sm text-gray-600">
                💾 All data saved locally on your device
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Secure • Local Storage • No Internet Required
          </p>
        </div>
      </div>
    </div>
  );
}