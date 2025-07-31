// DatabaseHealth component removed - no longer needed with local storage implementation

interface DatabaseHealthProps {
  className?: string;
}

export function DatabaseHealth({ className = "" }: DatabaseHealthProps) {
  return (
    <div className={`p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="font-medium text-blue-600">
            Local Storage Mode
          </span>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Backend: Local Browser Storage
      </div>
    </div>
  );
}