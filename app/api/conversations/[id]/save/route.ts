import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import {
  getConversationById,
  addMessages,
  saveCanvasState,
  updateConversation,
  getMessageCount,
} from '@/lib/db/conversations';

export const runtime = 'nodejs';

// POST /api/conversations/[id]/save
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = parseInt(session.user.id as string);
    const conversationId = parseInt(id);
    const body = await request.json() as {
      messages?: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>;
      canvasData?: Record<string, unknown>;
      currentPhase?: string;
    };
    const { messages, canvasData, currentPhase } = body;
    
    // Verify conversation belongs to user
    const conversation = await getConversationById(conversationId, userId);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Save new messages (only new ones)
    if (messages && messages.length > 0) {
      const existingCount = await getMessageCount(conversationId);
      const newMessages = messages.slice(existingCount);
      
      if (newMessages.length > 0) {
        await addMessages(conversationId, newMessages);
      }
    }
    
    // Save canvas state
    if (canvasData) {
      await saveCanvasState(conversationId, canvasData);
    }
    
    // Update conversation metadata
    const updates: {
      current_phase?: string;
      company_name?: string;
      title?: string;
    } = {};
    
    if (currentPhase) {
      updates.current_phase = currentPhase;
    }
    
    // Auto-generate title from first user message
    if (conversation.title === 'Ny analys' && messages && messages.length > 0) {
      const firstUserMessage = messages.find((m) => m.role === 'user');
      if (firstUserMessage) {
        const content = firstUserMessage.content.toLowerCase();
        const companyMatch = content.match(/(?:vi är|heter|kallas|vi heter) ([a-zåäö\s]+)/i);
        
        if (companyMatch) {
          updates.company_name = companyMatch[1].trim();
          updates.title = `${companyMatch[1].trim()} - Organisationsanalys`;
        }
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await updateConversation(conversationId, userId, updates);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}

