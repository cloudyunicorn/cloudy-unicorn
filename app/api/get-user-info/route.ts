import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: Request) {
  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json({ error: 'User not found' }, { 
        status: 401,
        headers: corsHeaders
      });
    }

    // Return only safe info; exclude sensitive data
    const userInfo = {
      id: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
      // add any other safe fields you want to expose
    };

    return NextResponse.json(userInfo, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error("getUserInfo API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
