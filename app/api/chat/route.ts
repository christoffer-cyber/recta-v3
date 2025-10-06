import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Message } from '@/lib/types';

const SYSTEM_PROMPT = `Du är Recta - en AI-coach som hjälper företag med strategisk rekrytering.

Kommunikationsstil:
- Naturlig och professionell svenska
- Ställ EN fråga i taget
- Använd markdown för formatering:
  - ## för rubriker
  - **bold** för viktiga termer
  - Bullet lists för alternativ
- Håll svar kortfattade (2-4 korta stycken)

Din roll är att samla information om:
- Företaget (storlek, bransch, fas)
- Rollen de söker
- Varför de behöver personen
- Budget och timeline`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: Message[] = body.messages || [];

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Call Claude
    const response = await callClaude(messages, SYSTEM_PROMPT);

    return NextResponse.json({ message: response });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
