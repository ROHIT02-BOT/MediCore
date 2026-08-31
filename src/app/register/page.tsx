
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  
  const reqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const allReqsMet = Object.values(reqs).every(Boolean);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!allReqsMet) {
      toast.error('Please meet all password requirements.');
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const pass = formData.get('password') as string;
    const confirmPass = formData.get('confirmPassword') as string;

    if (pass !== confirmPass) {
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created successfully. You can now log in.');
      router.push('/login');
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
          <CardTitle className='text-2xl font-bold tracking-tight'>Create your account</CardTitle>
          <CardDescription className='text-base'>
            Create a secure personal health account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Full Name</Label>
              <Input id='fullName' name='fullName' placeholder='John Doe' required disabled={isLoading} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input id='email' name='email' type='email' placeholder='you@example.com' required disabled={isLoading} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <div className='text-xs space-y-1 mt-2 text-muted-foreground'>
                <div className='flex items-center gap-1.5'>
                  {reqs.length ? <Check className='h-3 w-3 text-green-500' /> : <X className='h-3 w-3 text-muted-foreground/50' />} At least 8 characters
                </div>
                <div className='flex items-center gap-1.5'>
                  {reqs.upper ? <Check className='h-3 w-3 text-green-500' /> : <X className='h-3 w-3 text-muted-foreground/50' />} One uppercase letter
                </div>
                <div className='flex items-center gap-1.5'>
                  {reqs.lower ? <Check className='h-3 w-3 text-green-500' /> : <X className='h-3 w-3 text-muted-foreground/50' />} One lowercase letter
                </div>
                <div className='flex items-center gap-1.5'>
                  {reqs.number ? <Check className='h-3 w-3 text-green-500' /> : <X className='h-3 w-3 text-muted-foreground/50' />} One number
                </div>
                <div className='flex items-center gap-1.5'>
                  {reqs.special ? <Check className='h-3 w-3 text-green-500' /> : <X className='h-3 w-3 text-muted-foreground/50' />} One special character
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input id='confirmPassword' name='confirmPassword' type={showPassword ? 'text' : 'password'} required disabled={isLoading} />
            </div>
            
            <Button className='w-full mt-4 h-11' type='submit' disabled={isLoading || !allReqsMet}>
              {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
              Create Secure Account
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
        <CardFooter className='flex flex-col items-center justify-center space-y-4 pt-2 pb-8'>
          <div className='text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link href='/login' className='font-medium text-primary hover:underline'>
              Sign in
            </Link>
          </div>
          <p className='text-xs text-muted-foreground/60 text-center flex items-center'>
            <Shield className='mr-1 h-3 w-3' />
            Designed with privacy in mind.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

