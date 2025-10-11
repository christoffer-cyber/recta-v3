import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { createConversation, getConversationsByUserId } from '@/lib/db/conversations';

export const runtime = 'nodejs';

// GET /api/conversations - List all conversations
export async function GET() {
  const session = await getServerSession(authOptions);

  console.log('📞 GET /api/conversations - session:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email
  });

  if (!session?.user?.id) {
    console.log('❌ No session or user.id');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id as string);
  console.log('👤 Parsed userId:', userId, 'from:', session.user.id);
  
  // CRITICAL: Check for NaN
  if (isNaN(userId)) {
    console.error('❌ Invalid userId - NaN from:', session.user.id);
    return NextResponse.json({ 
      error: 'Invalid user session. Please logout and login again.' 
    }, { status: 400 });
  }

  try {
    const conversations = await getConversationsByUserId(userId);
    console.log('✅ Found conversations:', conversations.length);
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  console.log('📞 POST /api/conversations - session:', {
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email
  });
  
  if (!session?.user?.id) {
    console.log('❌ No session or user.id');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id as string);
  console.log('👤 Parsed userId:', userId, 'from:', session.user.id);
  
  // CRITICAL: Check for NaN
  if (isNaN(userId)) {
    console.error('❌ Invalid userId - NaN from:', session.user.id);
    return NextResponse.json({ 
      error: 'Invalid user session. Please logout and login again.' 
    }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { title, company_name } = body;

    console.log('📝 Creating conversation:', { userId, title, company_name });
    
    const conversation = await createConversation(
      userId,
      title || 'Ny analys',
      company_name
    );

    console.log('✅ Conversation created:', conversation.id);
    
    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

