import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/claude';
import { Message } from '@/lib/types';

function buildSystemPrompt(existingInsights: string[], currentConfidence: number): string {
  const isPhaseComplete = currentConfidence >= 100;
  
  const basePrompt = `Du är Recta - en AI-coach som hjälper företag med strategisk rekrytering.

Kommunikationsstil:
- Naturlig och professionell svenska
- Ställ EN fråga i taget
- Använd markdown för formatering:
  - ## för rubriker
  - **bold** för viktiga termer
  - Bullet lists för alternativ
- Håll svar kortfattade (2-4 korta stycken)`;

  // If phase is complete, change behavior
  if (isPhaseComplete) {
    return `${basePrompt}

**VIKTIGT: Fasen är nu 100% klar.**

Du ska INTE ställa fler frågor. Istället:
1. Tacka användaren för informationen
2. Sammanfatta kort vad ni har diskuterat
3. Förklara vad som händer i nästa fas
4. Fråga om de är redo att gå vidare

INGA insights behövs längre (skippa ###INSIGHTS### helt).

Exempel på avslutning:
"Perfekt! Nu har vi en tydlig bild av er situation.

**Sammanfattning:**
- 10-person eyewear-företag med 40M omsättning
- Behöver diversifiera marknadsföring från enbart performance
- Budget 600-800k för marknadschef

I nästa fas (Problem Discovery) djupdyker vi i rotorsaken till utmaningarna.

Är du redo att fortsätta?"`;
  }

  // Normal phase - include existing insights
  const insightsContext = existingInsights.length > 0
    ? `\n\n**TIDIGARE INSAMLAD INFORMATION:**
${existingInsights.map(i => `- ${i}`).join('\n')}

**VIKTIGT om insights:**
1. Kolla ovan vad du REDAN vet
2. Ställ INTE frågor om saker du redan har svar på
3. Om ny information kompletterar befintlig insight → UPPDATERA den istället för att skapa ny
4. Skapa bara NYA insights för helt ny information

Exempel:
- Befintlig: "Företag: 10 personer"
- Nytt svar: "Vi omsätter 40M"
- Output: "Företag: 10 personer, 40M omsättning" (uppdatera befintlig)
- INTE: Ny separat insight "Omsättning: 40M"

Exempel 2:
- Befintlig: "Roll: Marknadschef"
- Nytt svar: "Budget är 600-800k"
- Output: Ny insight "Budget: 600-800k/år" (helt ny kategori)
`
    : '\n\n**Du börjar nu samla information.**\n';

  return `${basePrompt}
${insightsContext}

Din roll är att samla information om:
- Företaget (storlek, bransch, fas, omsättning)
- Rollen de söker
- Varför de behöver personen
- Budget och timeline
- Nuvarande situation och utmaningar

I ditt svar, inkludera:
1. Ditt conversational response till användaren
2. Sen på en ny rad: "###INSIGHTS###" följt av strukturerade bullet points

Format för insights:
- Kortfattade, konkreta fakta
- Max 60 tecken per insight
- Börja med nyckelord: "Företag:", "Team:", "Mål:", "Roll:", "Budget:", "Problem:", etc.
- UPPDATERA befintliga insights om möjligt istället för att duplicera

Exempel:
Tack för informationen! Så ni växer snabbare än förväntat...

###INSIGHTS###
- Företag: 10 personer, premium eyewear, 40M (2023)
- Försäljning: 75-80% D2C, 20-25% B2B
- Utmaning: CPM-priserna ökar, behöver diversifiera`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: Message[] = body.messages || [];
    const existingInsights: string[] = body.existingInsights || [];
    const currentConfidence: number = body.currentConfidence || 0;

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Build dynamic system prompt with context
    const systemPrompt = buildSystemPrompt(existingInsights, currentConfidence);

    // Call Claude
    const fullResponse = await callClaude(messages, systemPrompt);

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
