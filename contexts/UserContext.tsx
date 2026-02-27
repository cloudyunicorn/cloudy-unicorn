'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserInfo, signOutAction } from '@/lib/actions/user.action';
import { UserMetadata } from "@supabase/supabase-js";
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
      // Use server action to sign out — runs on Vercel's servers,
      // bypassing ISP blocks on *.supabase.co domains
      await signOutAction();
    } catch (err) {
      console.error("Error signing out:", err);
    }
    // Always redirect, even if the server action had an issue.
    // Use hard redirect to fully clear client-side auth state & cookies.
    setUser(null);
    window.location.href = '/';
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
