// Mock authentication system for demo mode
import { hasRealSupabaseCredentials } from './supabase';

export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

export interface MockSession {
  user: MockUser;
  access_token: string;
  refresh_token: string;
}

class MockAuthSystem {
  private currentUser: MockUser | null = null;
  private currentSession: MockSession | null = null;
  private listeners: Array<(session: MockSession | null) => void> = [];

  constructor() {
    // Load persisted session from localStorage in demo mode
    if (!hasRealSupabaseCredentials) {
      this.loadPersistedSession();
    }
  }

  private loadPersistedSession() {
    try {
      const savedSession = localStorage.getItem('mock-auth-session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        this.currentUser = session.user;
        this.currentSession = session;
      }
    } catch (error) {
      console.warn('Failed to load persisted session:', error);
    }
  }

  private persistSession() {
    if (this.currentSession) {
      localStorage.setItem('mock-auth-session', JSON.stringify(this.currentSession));
    } else {
      localStorage.removeItem('mock-auth-session');
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentSession));
  }

  async signInWithPassword(email: string, password: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create mock user
    const user: MockUser = {
      id: `mock-${Date.now()}`,
      email,
      user_metadata: {}
    };

    const session: MockSession = {
      user,
      access_token: `mock-access-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`
    };

    this.currentUser = user;
    this.currentSession = session;
    this.persistSession();
    this.notifyListeners();

    return { data: { user, session }, error: null };
  }

  async signUp(email: string, password: string, options?: { data?: { name?: string } }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create mock user with metadata
    const user: MockUser = {
      id: `mock-${Date.now()}`,
      email,
      user_metadata: {
        name: options?.data?.name
      }
    };

    const session: MockSession = {
      user,
      access_token: `mock-access-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`
    };

    this.currentUser = user;
    this.currentSession = session;
    this.persistSession();
    this.notifyListeners();

    return { data: { user, session }, error: null };
  }

  async signOut() {
    this.currentUser = null;
    this.currentSession = null;
    this.persistSession();
    this.notifyListeners();

    return { error: null };
  }

  getSession() {
    return Promise.resolve({
      data: { session: this.currentSession },
      error: null
    });
  }

  onAuthStateChange(callback: (event: string, session: MockSession | null) => void) {
    this.listeners.push((session) => callback('SIGNED_IN', session));
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf((session) => callback('SIGNED_IN', session));
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }
}

export const mockAuth = new MockAuthSystem();
