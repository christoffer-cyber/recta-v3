'use client';

/**
 * Client-side auth helpers for NextAuth v5
 */

export async function clientSignIn(email: string, password: string) {
  try {
    // Call the NextAuth credentials endpoint
    const response = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        callbackUrl: '/dashboard',
      }),
    });

    if (!response.ok) {
      return { error: 'Invalid credentials' };
    }

    // Check if we got redirected (successful login)
    if (response.redirected) {
      window.location.href = response.url;
      return { success: true };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'Sign in failed' };
  }
}

export async function clientSignOut() {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
    });
    window.location.href = '/login';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

