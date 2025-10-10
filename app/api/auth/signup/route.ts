import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db/users';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email och lösenord krävs' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'En användare med denna email finns redan' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser(email, password);

    return NextResponse.json(
      { user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid registrering' },
      { status: 500 }
    );
  }
}

