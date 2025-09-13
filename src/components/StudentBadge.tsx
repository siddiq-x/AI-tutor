import { GraduationCap } from 'lucide-react';

interface StudentBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  placement?: 'header' | 'floating';
}

export function StudentBadge({ className = "", size = 'md', placement = 'header' }: StudentBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-3 py-2 text-xs gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const iconContainerSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconInnerSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  };

  const baseClasses = placement === 'floating' 
    ? 'fixed top-4 right-4 z-50 shadow-lg hover:shadow-xl'
    : 'inline-flex';

  return (
    <div className={`${baseClasses} items-center ${sizeClasses[size]} bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/60 dark:border-blue-700/60 rounded-full backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-105 ${className}`}>
      <div className={`flex items-center justify-center ${iconContainerSizes[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-sm`}>
        <GraduationCap className={`${iconInnerSizes[size]} text-white`} />
      </div>
      <span className="font-medium text-blue-700 dark:text-blue-300 whitespace-nowrap">
        Made by a Student for Students
      </span>
    </div>
  );
}