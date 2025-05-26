import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json(null);
    }

    // Return only safe info; exclude sensitive data
    const userInfo = {
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
      // add any other safe fields you want to expose
    };

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error("getUserInfo API error:", error);
    return NextResponse.json(null);
  }
}
