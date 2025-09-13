// Simplified supabase configuration to eliminate import errors
export const hasRealSupabaseCredentials = false

// Create a minimal client that won't cause import errors
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      setTimeout(() => callback('SIGNED_OUT', null), 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Use mock authentication' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Use mock authentication' } }),
    signOut: () => Promise.resolve({ error: null })
  }
}

export const testSupabaseConnection = async () => {
  console.warn('Using simplified supabase client - no connection test needed')
  return false
}