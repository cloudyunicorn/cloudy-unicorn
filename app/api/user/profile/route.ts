import { getUserProfileAndGoals } from "@/lib/actions/user.action";
import { NextResponse } from 'next/server';

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
    const data = await getUserProfileAndGoals();
    if (!data) {
      return NextResponse.json({ error: "User not found or not authenticated." }, { 
        status: 401,
        headers: corsHeaders
      });
    }
    return NextResponse.json(data, {
      headers: corsHeaders
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
