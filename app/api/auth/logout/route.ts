import { NextResponse } from 'next/server';
import { signOut } from '@/auth';

export const runtime = 'nodejs';

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

