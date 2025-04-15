"use server"

import { useSupabase } from "@/providers/supabase-provider";
import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface SignUpFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export async function signOutAction() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    redirect("/");
  };

export async function signInAction(values: FormValues) {
  const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
    return { error: error.message };
  }
  return { success: true };
}

export async function getUserId() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("User not found");
  }
  return data.user.id;
}
export async function getUserInfo() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("User not found");
  }
  return data.user;
}