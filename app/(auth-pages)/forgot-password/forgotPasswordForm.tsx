'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSupabase } from '@/providers/supabase-provider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof formSchema>;

interface ForgotPasswordFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ForgotPasswordForm({ onSuccess, onError }: ForgotPasswordFormProps) {
  const supabase = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      // Construct the redirect URL for the update password page
      const redirectUrl = `${window.location.origin}/update-password`; // Use the correct path

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        // Don't reveal if the email exists or not for security
        console.error('Forgot password error:', error);
        onError('An error occurred. Please try again.');
      } else {
        onSuccess(
          'If an account exists for this email, a password reset link has been sent.'
        );
      }
    } catch (err) {
       console.error('Forgot password unexpected error:', err);
       onError('An unexpected error occurred. Please try again.');
    }
     finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner size="sm" />
              Sending Link...
            </div>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>
    </Form>
  );
}
