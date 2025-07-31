import { Button } from "./ui/button";
import { Shield, LogOut } from "lucide-react";

interface AdminHeaderProps {
  userFullName: string;
  onLogout: () => void;
}

export function AdminHeader({ userFullName, onLogout }: AdminHeaderProps) {
  return (
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
              Welcome, {userFullName}
            </span>
            <Button
              onClick={onLogout}
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
  );
}