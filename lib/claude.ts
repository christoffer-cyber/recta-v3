import Anthropic from '@anthropic-ai/sdk';
import { Message } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function callClaude(
  messages: Message[],
  systemPrompt: string
): Promise<string> {
  // Filter out empty messages to avoid Claude API errors
  const validMessages = messages
    .filter(m => m.content && m.content.trim().length > 0)
    .map(m => ({
      role: m.role,
      content: m.content
    }));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: validMessages
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  
  throw new Error('Unexpected response type from Claude');
}
