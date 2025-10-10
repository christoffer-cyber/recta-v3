import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getConversationById,
  updateConversation,
  deleteConversation,
  getMessagesByConversationId,
  getCanvasState,
} from '@/lib/db/conversations';

export const runtime = 'nodejs';

// GET /api/conversations/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = parseInt(session.user.id as string);
    const conversationId = parseInt(id);
    
    const conversation = await getConversationById(conversationId, userId);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const messages = await getMessagesByConversationId(conversationId);
    const canvasData = await getCanvasState(conversationId);
    
    return NextResponse.json({
      conversation,
      messages,
      canvasData,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = parseInt(session.user.id as string);
    const conversationId = parseInt(id);
    const body = await request.json();
    
    const conversation = await updateConversation(conversationId, userId, body);
    
    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userId = parseInt(session.user.id as string);
    const conversationId = parseInt(id);
    
    const success = await deleteConversation(conversationId, userId);
    
    if (!success) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}

