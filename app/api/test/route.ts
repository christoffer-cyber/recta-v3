import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';

export async function GET() {
  try {
    const response = await callClaude(
      [{ role: 'user', content: 'Say hello in Swedish', timestamp: new Date().toISOString() }],
      'You are a helpful assistant.'
    );
    
    return NextResponse.json({ success: true, message: response });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
