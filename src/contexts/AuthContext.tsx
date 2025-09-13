import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, hasRealSupabaseCredentials } from '@/lib/supabase';
import { mockAuth } from '@/lib/mockAuth';

interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasRealSupabaseCredentials) {
      // Use real Supabase authentication
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Use mock authentication
      mockAuth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = mockAuth.onAuthStateChange((_event: any, session: any) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signOut = async () => {
    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      if (hasRealSupabaseCredentials && session) {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          const isSessionNotFoundError = error.message?.includes('Session from session_id claim in JWT does not exist') ||
                                       error.message?.includes('session_not_found');
          
          if (!isSessionNotFoundError) {
            console.error('Error signing out:', error);
          }
        }
      } else {
        // Use mock auth sign out
        await mockAuth.signOut();
      }
      
      // Force redirect to landing page
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}