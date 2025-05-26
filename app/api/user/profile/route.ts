import { getUserProfileAndGoals } from "@/lib/actions/user.action";
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getUserProfileAndGoals();
    if (!data) {
      return NextResponse.json({ error: "User not found or not authenticated." }, { status: 401 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}
