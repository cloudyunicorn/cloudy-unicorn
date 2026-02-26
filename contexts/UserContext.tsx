'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserInfo } from '@/lib/actions/user.action';
import { UserMetadata } from "@supabase/supabase-js";
import { useSupabase } from '@/providers/supabase-provider';
import { useRouter } from 'next/navigation';

interface UserContextProps {
  user: UserMetadata | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const supabase = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<UserMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserInfo();
      setUser(data?.user_metadata || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
      console.error("Error fetching user data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase sign out error:", error.message);
        throw new Error("Sign out failed. Please try again.");
      }
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error("Error signing out:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    await fetchUser();
  };

  const value = {
    user,
    isLoading,
    error,
    signOut: handleSignOut,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
