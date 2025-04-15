'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import { SignUpForm } from "./signUpForm";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function SignUpPage() {
  const [errorMsg, setErrorMsg] = useState('');
  const [message, setMessage] = useState('');

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
          onSuccess={() => setMessage('Sign up successful! Check your email for a confirmation link.')}
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