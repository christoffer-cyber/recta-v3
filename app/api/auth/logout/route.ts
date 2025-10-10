import { NextResponse } from 'next/server';

export async function POST() {
  // NextAuth v4 handles logout via /api/auth/signout
  // This is a legacy endpoint - redirect to NextAuth signout
  return NextResponse.redirect('/api/auth/signout');
}
