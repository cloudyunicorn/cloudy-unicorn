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
import { signInAction } from "@/lib/actions/user.action";
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface SignInFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function SignInForm({ onSuccess, onError }: SignInFormProps) {
  const supabase = useSupabase();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await signInAction(values);
      onSuccess();
    } catch (error) {
      setIsLoading(false);
      onError(error instanceof Error ? error.message : 'Sign in failed');
    }
  };

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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  );
}
