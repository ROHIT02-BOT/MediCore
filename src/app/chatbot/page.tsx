'use client';

import * as React from 'react';
import { Send, User, Bot, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatbotPage() {
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: 'Hello! I am your AI Health Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I understand you are asking about ' + userMessage + '. As an AI, I can provide general wellness information, but please remember I am not a doctor.' 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const quickQuestions = [
    'How can I improve my sleep?',
    'What is a healthy diet?',
    'How much exercise do I need?',
    'How can I manage stress?'
  ];

  return (
    <div className='container mx-auto px-4 max-w-4xl py-8 flex flex-col h-[calc(100vh-4rem)]'>
      
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>AI Health Assistant</h1>
        <p className='text-muted-foreground text-lg'>
          Get helpful answers to general health and wellness questions.
        </p>
      </div>

      {/* Chat Card */}
      <Card className='flex-1 flex flex-col border-border/50 shadow-md overflow-hidden'>
        <div className='bg-secondary/30 p-3 text-xs text-muted-foreground flex items-center justify-center gap-2 border-b'>
          <AlertTriangle className='h-4 w-4 text-amber-500' />
          <span>
            <strong className='font-semibold'>Medical Disclaimer:</strong> This assistant provides general info only and should not replace professional medical advice.
          </span>
        </div>
        
        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-6 pb-4'>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <Avatar className='h-8 w-8 mt-1 border bg-primary/10'>
                    <AvatarFallback className='bg-transparent text-primary'><Bot className='h-4 w-4' /></AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-[75%] ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  <p className='text-sm leading-relaxed'>{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <Avatar className='h-8 w-8 mt-1 border'>
                    <AvatarFallback className='bg-secondary text-secondary-foreground'><User className='h-4 w-4' /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className='flex gap-4 justify-start'>
                <Avatar className='h-8 w-8 mt-1 border bg-primary/10'>
                  <AvatarFallback className='bg-transparent text-primary'><Bot className='h-4 w-4' /></AvatarFallback>
                </Avatar>
                <div className='rounded-2xl px-4 py-3 bg-muted rounded-tl-sm flex items-center gap-1.5'>
                  <div className='h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
                  <div className='h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
                  <div className='h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
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
                  onClick={() => {
                    setInput(q);
                  }}
                >
                  {q}
                </Button>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSend} className='flex gap-2 relative'>
            <Input 
              placeholder='Ask your health question...' 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='pr-12 py-6 rounded-full bg-secondary/50 border-border/50 focus-visible:ring-1'
              disabled={isTyping}
            />
            <Button 
              type='submit' 
              size='icon' 
              className='absolute right-1.5 top-1.5 h-9 w-9 rounded-full'
              disabled={!input.trim() || isTyping}
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
