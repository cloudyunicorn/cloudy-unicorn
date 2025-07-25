'use client';

import React, { useEffect, useState } from 'react';
import Modetoggle from './mode-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlignJustify, UserPen } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserButton from './user-button';
import { useSupabase } from '@/providers/supabase-provider';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

const Menu = () => {
  const supabase = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  // Removed isLoading state

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    }
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
          setSession(null);
        } else {
          setSession(session);
        }
        // Removed setIsLoading(false) here - loading state is handled by the form now
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="flex justify-end gap-3 p-5">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        {!session && (
          <>
            <Button asChild variant="ghost">
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </>
        )}
        <Modetoggle />
        {session && <UserButton />}
      </nav>
      <nav className="md:hidden flex items-center gap-2">
        <Modetoggle />
        <Sheet>
          <SheetTrigger className="align-middle">
            <AlignJustify />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>Menu</SheetTitle>
            {!session && (
              <>
                {/* Removed isLoading state and onClick handler */}
                <Button asChild variant="ghost">
                  <Link href="/sign-in">
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
            {session && (
              <Button asChild variant="ghost">
                <Link href="/new-group">
                  <UserPen /> Profile
                </Link>
              </Button>
            )}
            {session && <UserButton />}
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
