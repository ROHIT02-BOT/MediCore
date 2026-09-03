'use client';

import * as React from 'react';
import { Send, User, Bot, AlertTriangle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! I'm your AI Health Assistant powered by Google Gemini. Ask me anything about health, wellness, nutrition, fitness, or general medical information. How can I help you today?",
};

const STORAGE_KEY = 'medicore_chat_history';

export default function ChatbotPage() {
  const [messages, setMessages] = React.useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (parsed.length > 0) setMessages(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  React.useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // ignore storage errors
      }
    }
  }, [messages]);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const messageText = (overrideInput ?? input).trim();
    if (!messageText || isStreaming) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setError(null);

    // Add empty assistant message that we'll stream into
    const assistantIndex = newMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || 'Request failed');
      }

      // Stream the response into the last message
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIndex] = { role: 'assistant', content: fullText };
          return updated;
        });
      }

      if (!fullText) throw new Error('Empty response from AI.');
    } catch (err: any) {
      // Remove the empty assistant message on error
      setMessages(prev => prev.slice(0, assistantIndex));
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = () => {
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Chat history cleared.');
  };

  const quickQuestions = [
    'How can I improve my sleep?',
    'What is a healthy diet?',
    'How much exercise do I need?',
    'How can I manage stress better?',
  ];

  return (
    <div className='container mx-auto px-4 max-w-4xl py-8 flex flex-col h-[calc(100vh-4rem)]'>

      {/* Header */}
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight mb-2'>AI Health Assistant</h1>
          <p className='text-muted-foreground text-lg'>
            Powered by Google Gemini — your personal health companion.
          </p>
        </div>
        {messages.length > 1 && (
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-destructive mt-1'
            onClick={clearHistory}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Clear chat
          </Button>
        )}
      </div>

      {/* Chat Card */}
      <Card className='flex-1 flex flex-col border-border/50 shadow-md overflow-hidden'>
        <div className='bg-secondary/30 p-3 text-xs text-muted-foreground flex items-center justify-center gap-2 border-b'>
          <AlertTriangle className='h-4 w-4 text-amber-500 shrink-0' />
          <span>
            <strong className='font-semibold'>Medical Disclaimer:</strong> General wellness info only — not a substitute for professional medical advice.
          </span>
        </div>

        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-6 pb-4'>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <Avatar className='h-8 w-8 mt-1 border bg-primary/10 shrink-0'>
                    <AvatarFallback className='bg-transparent text-primary'><Bot className='h-4 w-4' /></AvatarFallback>
                  </Avatar>
                )}

                <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-[75%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  {msg.content ? (
                    <p className='text-sm leading-relaxed whitespace-pre-wrap'>{msg.content}</p>
                  ) : (
                    // Streaming typing dots for empty assistant message
                    <div className='flex items-center gap-1.5 py-1'>
                      <div className='h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                      <div className='h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
                      <div className='h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <Avatar className='h-8 w-8 mt-1 border shrink-0'>
                    <AvatarFallback className='bg-secondary text-secondary-foreground'><User className='h-4 w-4' /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {error && (
              <div className='flex justify-center'>
                <div className='bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-lg flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4 shrink-0' />
                  {error}
                  <button onClick={() => setError(null)} className='underline ml-1 hover:no-underline'>Dismiss</button>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className='p-4 bg-background border-t'>
          {messages.length === 1 && (
            <div className='flex flex-wrap gap-2 mb-4'>
              {quickQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant='outline'
                  size='sm'
                  className='rounded-full text-xs text-muted-foreground hover:text-primary'
                  onClick={(e) => handleSend(e as any, q)}
                  disabled={isStreaming}
                >
                  {q}
                </Button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className='flex gap-2 relative'>
            <Input
              ref={inputRef}
              placeholder='Ask your health question...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='pr-12 py-6 rounded-full bg-secondary/50 border-border/50 focus-visible:ring-1'
              disabled={isStreaming}
            />
            <Button
              type='submit'
              size='icon'
              className='absolute right-1.5 top-1.5 h-9 w-9 rounded-full'
              disabled={!input.trim() || isStreaming}
            >
              <Send className='h-4 w-4' />
              <span className='sr-only'>Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
