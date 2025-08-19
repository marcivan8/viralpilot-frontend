import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Validation des variables d'environnement (utilise VITE_ au lieu de REACT_APP_)
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Récupérer session actuelle
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Optionnel: créer/mettre à jour le profil utilisateur
        if (event === 'SIGNED_IN' && session?.user) {
          await createOrUpdateProfile(session.user, session);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createOrUpdateProfile = async (user, currentSession) => {
    try {
      if (!import.meta.env.VITE_API_BASE_URL) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.user_metadata?.name
        })
      });
      
      if (!response.ok) {
        console.warn('Profile creation/update failed:', response.status);
      }
    } catch (error) {
      console.error('Profile error:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { 
            full_name: fullName?.trim() || '',
            name: fullName?.trim() || ''
          }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const getAccessToken = () => {
    return session?.access_token || null;
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    getAccessToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;