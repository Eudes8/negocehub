import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextData {
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) throw error;
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
    // If registration is successful, we might want to update the public.users table with the name
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, name, email }]);
      if (insertError) {
        // Handle error, maybe log it or revert auth signup if critical
        console.error('Error inserting user profile:', insertError);
        // Optionally, you might want to sign out the user if profile creation failed
        // await supabase.auth.signOut();
        throw insertError;
      }
    }
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) throw error;
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);