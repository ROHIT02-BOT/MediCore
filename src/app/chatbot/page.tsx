'use client';

import * as React from 'react';
import { Send, User, Bot, AlertTriangle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! I'm **MediCore AI** — your comprehensive Health Information Assistant powered by Google Gemini.\n\nI can help you with:\n- 🤒 Symptoms & diseases\n- 💊 Medicines & side effects\n- 🧪 Lab reports & test results\n- 🧠 Mental health & wellness\n- 🥗 Nutrition, diet & fitness\n- 🚑 First aid & emergency guidance\n- And much more!\n\nHow can I help you today?",
};

const STORAGE_KEY = 'medicore_chat_history';

export default function ChatbotPage() {
  const [messages, setMessages] = React.useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (parsed.length > 0) setMessages(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage on change
  React.useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch { /* ignore */ }
    }
  }, [messages]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault();
    const messageText = (overrideInput ?? input).trim();
    if (!messageText || isStreaming) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);
    setError(null);

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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIndex] = { role: 'assistant', content: fullText };
          return updated;
        });
      }

      if (!fullText) throw new Error('Empty response from AI.');
    } catch (err: any) {
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
    'What are symptoms of diabetes?',
    'How to manage high blood pressure?',
    'What does high creatinine mean?',
    'Tips for better sleep?',
  ];

  return (
    <div className='container mx-auto px-4 max-w-4xl py-8 flex flex-col' style={{ height: 'calc(100vh - 4rem)' }}>

      {/* Header */}
      <div className='mb-4 flex items-start justify-between shrink-0'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight mb-1'>AI Health Assistant</h1>
          <p className='text-muted-foreground'>
            Powered by Google Gemini — your personal health companion.
          </p>
        </div>
        {messages.length > 1 && (
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-destructive mt-1 shrink-0'
            onClick={clearHistory}
          >
            <Trash2 className='h-4 w-4 mr-1' />
            Clear chat
          </Button>
        )}
      </div>

      {/* Chat Card — fills remaining height */}
      <Card className='flex flex-col border-border/50 shadow-md overflow-hidden min-h-0 flex-1'>

        {/* Disclaimer */}
        <div className='bg-secondary/30 px-3 py-2 text-xs text-muted-foreground flex items-center justify-center gap-2 border-b shrink-0'>
          <AlertTriangle className='h-3.5 w-3.5 text-amber-500 shrink-0' />
          <span>
            <strong className='font-semibold'>Medical Disclaimer:</strong> General wellness info only — not a substitute for professional medical advice.
          </span>
        </div>

        {/* Scrollable messages area */}
        <div
          ref={scrollContainerRef}
          className='flex-1 overflow-y-auto min-h-0 p-4'
        >
          <div className='space-y-5 pb-2'>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <Avatar className='h-8 w-8 mt-1 border bg-primary/10 shrink-0'>
                    <AvatarFallback className='bg-transparent text-primary'><Bot className='h-4 w-4' /></AvatarFallback>
                  </Avatar>
                )}

                <div className={`rounded-2xl px-4 py-3 max-w-[88%] sm:max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm text-sm'
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <p className='text-sm leading-relaxed'>{msg.content}</p>
                  ) : msg.content ? (
                    <div className='prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed
                      prose-headings:font-semibold prose-headings:text-foreground prose-headings:mt-3 prose-headings:mb-1
                      prose-p:my-1 prose-p:text-foreground
                      prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5 prose-li:text-foreground
                      prose-ol:my-1 prose-ol:pl-4
                      prose-strong:text-foreground prose-strong:font-semibold
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline'>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    // Typing dots while streaming empty message
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

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div className='p-4 bg-background border-t shrink-0'>
          {messages.length === 1 && (
            <div className='flex flex-wrap gap-2 mb-3'>
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
