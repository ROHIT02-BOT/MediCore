'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Menu, X, Moon, Sun, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';

export function Navbar() {
  const [user, setUser] = React.useState<any>(null);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully.');
    router.push('/');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Medical Records', href: '/medical-records' },
    { name: 'Medicine Reminders', href: '/reminders' },
    { name: 'Health Tools', href: '/health-tools' },
    { name: 'AI Assistant', href: '/chatbot' },
  ];

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm'>
      <div className='container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Link href='/' className='flex items-center gap-2'>
            <Shield className='h-6 w-6 text-primary' />
            <span className='font-bold text-lg tracking-tight'>SecureMed</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        {user && (
          <nav className='hidden md:flex items-center gap-6'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}

        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className='h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            <span className='sr-only'>Toggle theme</span>
          </Button>

          {user ? (
            <div className='hidden md:block'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-primary/10 text-primary'>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end' forceMount>
                  <div className='flex items-center justify-start gap-2 p-2'>
                    <div className='flex flex-col space-y-1 leading-none'>
                      <p className='font-medium'>{user.user_metadata?.full_name || 'User'}</p>
                      <p className='w-[200px] truncate text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href='/profile' className='cursor-pointer'>
                      <Settings className='mr-2 h-4 w-4' />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/emergency' className='cursor-pointer'>
                      <User className='mr-2 h-4 w-4' />
                      <span>Emergency Information</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className='cursor-pointer text-destructive focus:text-destructive'>
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className='hidden md:flex gap-2'>
              <Link href='/login' className={buttonVariants({ variant: 'ghost' })}>
                Login
              </Link>
              <Link href='/register' className={buttonVariants({ variant: 'default' })}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className='md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side='left' className='w-[300px] sm:w-[400px]'>
              <SheetTitle className='hidden'>Menu</SheetTitle>
              <SheetDescription className='hidden'>Navigation menu</SheetDescription>
              <Link href='/' className='flex items-center gap-2 mb-8' onClick={() => setIsOpen(false)}>
                <Shield className='h-6 w-6 text-primary' />
                <span className='font-bold text-lg'>SecureMed</span>
              </Link>
              
              <div className='flex flex-col gap-4'>
                {user ? (
                  <>
                    <div className='px-2 py-4 mb-4 bg-muted/50 rounded-lg'>
                      <p className='font-medium'>{user.user_metadata?.full_name || 'User'}</p>
                      <p className='text-sm text-muted-foreground truncate'>{user.email}</p>
                    </div>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-base font-medium transition-colors hover:text-primary ${
                          pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                    <div className='my-2 border-t' />
                    <Link href='/profile' onClick={() => setIsOpen(false)} className='text-base font-medium text-muted-foreground hover:text-primary'>
                      Profile Settings
                    </Link>
                    <Link href='/emergency' onClick={() => setIsOpen(false)} className='text-base font-medium text-muted-foreground hover:text-primary'>
                      Emergency Information
                    </Link>
                    <Button variant='outline' className='mt-4 justify-start text-destructive' onClick={() => { handleLogout(); setIsOpen(false); }}>
                      <LogOut className='mr-2 h-4 w-4' />
                      Log out
                    </Button>
                  </>
                ) : (
                  <div className='flex flex-col gap-4 mt-4'>
                    <Link href='/login' onClick={() => setIsOpen(false)} className={buttonVariants({ variant: 'default' })}>
                      Login
                    </Link>
                    <Link href='/register' onClick={() => setIsOpen(false)} className={buttonVariants({ variant: 'outline' })}>
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
