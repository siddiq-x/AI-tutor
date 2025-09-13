import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully 👋",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logged out 👋",
        description: "You have been signed out.",
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Logout Button (only when authenticated) */}
      {!loading && user && (
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-10 px-3 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-gray-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/10 hover:scale-105 active:scale-95"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <span className="sr-only">Sign out</span>
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Logout</span>
        </div>
      )}

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="w-12 h-12 p-0 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-gray-200/60 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/10 hover:scale-105 active:scale-95"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-yellow-500" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-blue-400" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}