import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 p-0 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-gray-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/10 hover:scale-105 active:scale-95"
        aria-label="Profile menu"
      >
        <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-12 left-0 z-[60] min-w-[200px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <div className="p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}