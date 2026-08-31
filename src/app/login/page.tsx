
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully.');
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 py-12'>
      <Card className='w-full max-w-md shadow-lg border-border/50'>
        <CardHeader className='space-y-2 text-center pb-6'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
            <Shield className='h-6 w-6 text-primary' />
          </div>
          <CardTitle className='text-2xl font-bold tracking-tight'>Welcome back</CardTitle>
          <CardDescription className='text-base'>
            Sign in securely to access your health information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='you@example.com'
                required
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <Link href='#' className='text-sm font-medium text-primary hover:underline'>
                  Forgot password?
                </Link>
              </div>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  <span className='sr-only'>Toggle password visibility</span>
                </Button>
              </div>
            </div>
            <Button className='w-full mt-2 h-11' type='submit' disabled={isLoading}>
              {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
              Sign In
            </Button>
          </form>

          <div className='relative my-8'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-card px-2 text-muted-foreground'>OR</span>
            </div>
          </div>

          <Button
            variant='outline'
            className='w-full h-11 bg-background'
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className='mr-2 h-4 w-4' aria-hidden='true' focusable='false' data-prefix='fab' data-icon='google' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 488 512'>
              <path fill='currentColor' d='M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z'></path>
            </svg>
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className='flex flex-col items-center justify-center space-y-4 pt-4 pb-8'>
          <div className='text-sm text-muted-foreground'>
            Don't have an account?{' '}
            <Link href='/register' className='font-medium text-primary hover:underline'>
              Create account
            </Link>
          </div>
          <p className='text-xs text-muted-foreground/60 text-center flex items-center'>
            <Shield className='mr-1 h-3 w-3' />
            Your data is protected using Supabase authentication
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

