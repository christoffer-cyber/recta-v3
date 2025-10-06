'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ChatSidebar } from '@/components/ChatSidebar';
import { Canvas } from '@/components/Canvas';
import { Message } from '@/lib/types';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Välkommen till Recta! 👋\n\nJag hjälper dig att bygga en strategisk rekryteringsplan.\n\nLåt oss börja med att förstå er situation:\n\n- Hur många är ni i företaget?\n- Vilken roll letar ni efter?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API (we'll implement this properly later)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message || 'Tack för informationen!',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Ett fel uppstod. Försök igen.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      chat={
        <ChatSidebar
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      }
      canvas={<Canvas />}
    />
  );
}