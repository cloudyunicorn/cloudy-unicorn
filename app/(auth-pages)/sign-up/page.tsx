'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import { SignUpForm } from "./signUpForm";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useSupabase } from "@/providers/supabase-provider";
import { Session } from "@supabase/supabase-js";
import { Spinner } from "@/components/ui/spinner";

export default function SignUpPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [message, setMessage] = useState('');
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
    <div className="w-full max-w-md mx-auto p-4 bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 border bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="space-y-2">
          <Link href="/" className="flex justify-center items-center">
            <Logo />
          </Link>
        </CardHeader>
        <CardTitle className="text-center">
          Sign Up
        </CardTitle>
        <CardDescription className="text-center">
          Join CyberSculpt
        </CardDescription>

        {errorMsg && (
          <Alert variant="destructive" className="text-destructive-foreground bg-destructive/90">
            {errorMsg}
          </Alert>
        )}

        {message && (
          <Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {message}
          </Alert>
        )}

        <SignUpForm
          onSuccess={() => {
            setMessage('Sign up successful! Redirecting to dashboard...');
            router.push('/dashboard');
          }}
          onError={(message) => setErrorMsg(message)}
        />

        <div className="text-center text-sm space-y-2">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Button
              variant="link"
              className="text-foreground hover:text-primary px-1 h-auto font-medium"
              asChild
            >
              <a href="/sign-in">Sign in here</a>
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
