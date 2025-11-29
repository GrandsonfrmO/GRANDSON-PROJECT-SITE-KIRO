'use client';

interface MobileLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'white' | 'neutral';
  text?: string;
}

export default function MobileLoadingSpinner({ 
  size = 'md', 
  color = 'accent',
  text 
}: MobileLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    accent: 'border-accent',
    white: 'border-white',
    neutral: 'border-neutral-600'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-neutral-200 rounded-full animate-spin`}>
          <div className={`absolute inset-0 border-4 border-transparent ${colorClasses[color]} border-t-current rounded-full animate-spin`}></div>
        </div>
        
        {/* Inner pulse */}
        <div className={`absolute inset-2 bg-current opacity-20 rounded-full animate-pulse ${colorClasses[color]}`}></div>
      </div>
      
      {text && (
        <p className={`text-sm font-medium animate-pulse ${
          color === 'white' ? 'text-white' : 'text-neutral-600'
        }`}>
          {text}
        </p>
      )}
    </div>
  );
}