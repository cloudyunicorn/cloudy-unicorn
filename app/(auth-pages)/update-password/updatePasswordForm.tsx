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
import { useRouter } from 'next/navigation'; // Import useRouter

// Schema with password confirmation
const formSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Set the error path to confirmPassword field
  });

type FormValues = z.infer<typeof formSchema>;

interface UpdatePasswordFormProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function UpdatePasswordForm({ onSuccess, onError }: UpdatePasswordFormProps) {
  const supabase = useSupabase();
  const router = useRouter(); // Initialize router
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      // Supabase automatically handles the session/token from the URL
      // when the user arrives via the password reset link.
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        onError(
          `Failed to update password: ${error.message}. The link might be expired or invalid.`
        );
      } else {
        onSuccess('Password updated successfully! Redirecting to sign in...');
        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      }
    } catch (err) {
      console.error('Update password error:', err);
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
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
              Updating Password...
            </div>
          ) : (
            'Update Password'
          )}
        </Button>
      </form>
    </Form>
  );
}
