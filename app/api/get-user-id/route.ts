import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({ userId: data.user.id });
  } catch (error) {
    console.error("getUserId API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
