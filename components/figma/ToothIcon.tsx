export function ToothIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 5.2 7.5 6.5 7.5 8C7.5 9.5 7.8 10.8 8.5 12C9.2 13.2 10.5 14 12 14C13.5 14 14.8 13.2 15.5 12C16.2 10.8 16.5 9.5 16.5 8C16.5 6.5 16.2 5.2 15.5 4C14.8 2.8 13.5 2 12 2Z" 
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor" 
        strokeWidth="1.5"
      />
      <path 
        d="M10 16C10 17.1 10.4 18.1 11.1 18.8C11.8 19.5 12.8 19.9 14 19.9C15.2 19.9 16.2 19.5 16.9 18.8C17.6 18.1 18 17.1 18 16C18 15.4 17.8 14.8 17.5 14.3"
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <path 
        d="M14 16C14 17.1 13.6 18.1 12.9 18.8C12.2 19.5 11.2 19.9 10 19.9C8.8 19.9 7.8 19.5 7.1 18.8C6.4 18.1 6 17.1 6 16C6 15.4 6.2 14.8 6.5 14.3"
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <circle cx="10" cy="7" r="1" fill="currentColor"/>
      <circle cx="14" cy="7" r="1" fill="currentColor"/>
    </svg>
  );
}