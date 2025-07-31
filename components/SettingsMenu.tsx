import { Download, RefreshCw, LogOut, X } from "lucide-react";
import { Button } from "./ui/button";
import { Task } from "./constants/taskData";
import { useEffect, useRef } from 'react';
import { generatePDF } from './utils/pdfGenerator';
import { generateDentalSuggestions } from './utils/dentalSuggestions';

interface SettingsMenuProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSaveAndRefresh: () => void;
}

export function SettingsMenu({ tasks, isOpen, onClose, onLogout, onSaveAndRefresh }: SettingsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Ensure tasks is an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const suggestions = generateDentalSuggestions(safeTasks);

  // Handle outside clicks
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleGeneratePDF = async () => {
    try {
      const pdf = await generatePDF(safeTasks, currentMonth, suggestions);
      
      // Save the PDF
      pdf.save(`Workflow-Tracker-Report-${currentMonth.replace(' ', '-')}.pdf`);
      
      console.log('Professional PDF generated successfully');
      onClose(); // Close menu after successful PDF generation
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleSaveAndRefresh = async () => {
    try {
      await onSaveAndRefresh();
      onClose(); // Close menu after successful save
    } catch (error) {
      console.error('Error in save and refresh:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    onClose(); // Close menu when logging out
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className={`fixed left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transition-transform duration-300 ease-out max-w-md mx-auto ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          bottom: '80px', // Position above the bottom navigation (approx height)
          height: 'auto', 
          minHeight: '280px', 
          maxHeight: '400px' 
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 w-8 h-8 p-0 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="px-6 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600">Export reports and manage your account</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGeneratePDF}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              size="lg"
            >
              <Download className="w-4 h-4" />
              <div className="text-left">
                <div className="font-semibold">Export Report</div>
                <div className="text-xs opacity-90">PDF with insights & tips</div>
              </div>
            </Button>

            <Button
              onClick={handleSaveAndRefresh}
              variant="outline"
              className="w-full flex items-center justify-center gap-3"
              size="lg"
            >
              <RefreshCw className="w-4 h-4" />
              <div className="text-left">
                <div className="font-semibold">Save & Refresh</div>
                <div className="text-xs text-gray-600">Sync your progress</div>
              </div>
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 text-red-600 border-red-200 hover:bg-red-50"
              size="lg"
            >
              <LogOut className="w-4 h-4" />
              <div className="text-left">
                <div className="font-semibold">Logout</div>
                <div className="text-xs text-gray-600">Sign out safely</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}