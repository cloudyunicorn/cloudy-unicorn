'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import Logo from '@/components/Logo';
import Link from 'next/link';
import { SignInForm } from "./signInForm";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/providers/supabase-provider";
import { Session } from "@supabase/supabase-js";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const { refreshUser } = useUser();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check if user is already signed in
    supabase.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
        if (data.session) {
          // User already has a valid session, redirect
          router.push('/dashboard');
        } else {
          setLoading(false)
        }
      }
    );
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8 space-y-6 border bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader className="space-y-2">
          <Link href="/" className="flex justify-center items-center">
            <Logo />
          </Link>
        </CardHeader>
        <CardTitle className="text-center">
          Sign In
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account
        </CardDescription>

        {errorMsg && (
          <Alert
            variant="destructive"
            className="text-destructive-foreground bg-destructive/90"
          >
            {errorMsg}
          </Alert>
        )}

        <SignInForm
          onSuccess={async () => {
            await refreshUser();
            router.push('/dashboard');
          }}
          onError={(message) => setErrorMsg(message)}
        />

        <div className="text-center text-sm space-y-2">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="text-foreground hover:text-primary px-1 h-auto font-medium"
              asChild
            >
              <Link href="/sign-up">Create account</Link>
            </Button>
          </p>
          <Button
            variant="link"
            className="text-muted-foreground hover:text-foreground h-auto text-xs"
            asChild
          >
            <Link href="/forgot-password">Forgot password?</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
