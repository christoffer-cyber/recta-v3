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

VIKTIGT: Efter varje user-svar, extrahera de viktigaste insikterna i strukturerad form.

Din roll är att samla information om:
- Företaget (storlek, bransch, fas)
- Rollen de söker
- Varför de behöver personen
- Budget och timeline

I ditt svar, inkludera:
1. Ditt conversational response till användaren
2. Sen på en ny rad: "###INSIGHTS###" följt av strukturerade bullet points

Format för insights:
- Kortfattade, konkreta fakta
- Max 60 tecken per insight
- Börja med nyckelord: "Företag:", "Team:", "Mål:", "Roll:", "Bransch:", etc.

Exempel:
Tack för informationen! Så ni är 25 personer...

###INSIGHTS###
- Företag: GLAS Eyewear (konsumentglasögon)
- Team: 9 personer, ingen CMO
- Mål: Växa med lägre CAC`;

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
    const fullResponse = await callClaude(messages, SYSTEM_PROMPT);

    // Split response into message and insights
    const [message, insightSection] = fullResponse.split('###INSIGHTS###');
    
    const insights = insightSection 
      ? insightSection
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().substring(2)) // Remove "- "
      : [];

    return NextResponse.json({ 
      message: message.trim(),
      insights: insights.length > 0 ? insights : undefined
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
