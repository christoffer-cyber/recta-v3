"use client";
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.user) {
          setState({ user: data.user, loading: false });
        } else {
          setState({ user: null, loading: false });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setState({ user: null, loading: false });
      }
    };

    checkAuth();
  }, []);

  return state;
}

