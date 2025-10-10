import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createConversation, getConversationsByUserId } from '@/lib/db/conversations';

export const runtime = 'nodejs';

// GET /api/conversations - List all conversations
export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id as string);
    const conversations = await getConversationsByUserId(userId);
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, company_name } = body;
    
    const userId = parseInt(session.user.id as string);
    const conversation = await createConversation(
      userId,
      title || 'Ny analys',
      company_name
    );
    
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

