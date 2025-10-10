"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface Conversation {
  id: number;
  title: string;
  company_name: string | null;
  status: 'in_progress' | 'completed';
  current_phase: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Handler: Create new conversation
  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Ny analys' }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
  
      const data = await response.json();
      
      if (data.conversation) {
        // Redirect to main app with conversation ID
        window.location.href = `/?conversation=${data.conversation.id}`;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Kunde inte skapa ny analys. Försök igen.');
    }
  };

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        
        if (data.conversations) {
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNewConversation]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Är du säker på att du vill radera denna analys?')) {
      return;
    }

    const previousConversations = [...conversations];
    setConversations(prev => prev.filter(c => c.id !== id));

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setConversations(previousConversations);
      alert('Något gick fel vid radering. Försök igen.');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    return conv.status === filter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="flex gap-3">
                  <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Recta</h1>
              <p className="text-xs text-gray-500">AI Powered Organizational Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logga ut
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mina Analyser</h2>
          <p className="text-gray-600">
            Hantera och återuppta dina organisationsanalyser
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Alla ({conversations.length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              filter === 'in_progress'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Pågående ({conversations.filter(c => c.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              filter === 'completed'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Slutförda ({conversations.filter(c => c.status === 'completed').length})
          </button>
        </div>

        <button
          onClick={handleNewConversation}
          className="w-full mb-4 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:from-blue-100 hover:to-indigo-100 transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <div className="text-left">
              <div className="text-xl font-semibold text-blue-900">Starta Ny Analys</div>
              <div className="text-xs text-blue-600 mt-1">⌘N eller Ctrl+N</div>
            </div>
          </div>
        </button>

        {filteredConversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Inga analyser än' : `Inga ${filter === 'in_progress' ? 'pågående' : 'slutförda'} analyser`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Kom igång genom att skapa din första organisationsanalys' 
                : 'Byt filter för att se andra analyser'}
            </p>
            {filter === 'all' && (
              <button
                onClick={handleNewConversation}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Starta Din Första Analys
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface ConversationCardProps {
  conversation: Conversation;
  onDelete: (id: number) => void;
}

function ConversationCard({ conversation, onDelete }: ConversationCardProps) {
  const router = useRouter();

  const getStatusBadge = () => {
    if (conversation.status === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Slutförd
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Pågående • {conversation.current_phase}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Igår';
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {conversation.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{formatDate(conversation.updated_at)}</span>
            <span>•</span>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {conversation.company_name && (
        <p className="text-sm text-gray-600 mb-4">
          Företag: {conversation.company_name}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/?conversation=${conversation.id}`)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Fortsätt
        </button>

        <button
          onClick={() => onDelete(conversation.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Radera"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
