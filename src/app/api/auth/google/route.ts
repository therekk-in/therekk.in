import { NextResponse } from "next/server";

// Simulated Google OAuth. In a real implementation, integrate with Supabase Auth.
// Here we redirect back with a query param so the client can simulate the flow.
export async function GET() {
  return NextResponse.json({
    info: "Google OAuth integration. Configure NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY to enable.",
    redirect: "/auth/google-callback",
  });
}
