'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let subscription: any = null;

    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Auth getSession error:", error);
        }
        if (active) {
          setUser(data?.session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth getSession insecure/blocked host:", err);
        if (active) {
          setLoading(false);
        }
      }

      try {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (active) {
            setUser(session?.user ?? null);
            setLoading(false);
          }
        });
        subscription = data?.subscription;
      } catch (err) {
        console.error("Auth onAuthStateChange blocked host:", err);
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      active = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.error("Unsubscribe failed:", e);
        }
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
