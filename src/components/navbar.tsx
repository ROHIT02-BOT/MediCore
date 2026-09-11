'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Menu, Moon, Sun, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';

export function Navbar() {
  const [user, setUser] = React.useState<any>(null);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);

  // Native profile dropdown — no Base UI Portal, no scroll interference
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close profile dropdown when route changes
  React.useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  // Close on click-outside
  React.useEffect(() => {
    if (!isProfileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isProfileOpen]);

  // Close on Escape
  React.useEffect(() => {
    if (!isProfileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
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
            /* Native dropdown — rendered inline in the header (no Portal, no stacking isolation) */
            <div className='hidden md:block relative' ref={profileRef}>
              <button
                type='button'
                onClick={() => setIsProfileOpen((v) => !v)}
                aria-haspopup='true'
                aria-expanded={isProfileOpen}
                className='relative h-8 w-8 rounded-full inline-flex items-center justify-center hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              >
                <Avatar className='h-8 w-8'>
                  <AvatarFallback className='bg-primary/10 text-primary'>
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>

              {isProfileOpen && (
                <div className='absolute right-0 top-full mt-1 w-56 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 z-50 p-1 animate-in fade-in-0 zoom-in-95'>
                  <div className='flex items-center justify-start gap-2 p-2'>
                    <div className='flex flex-col space-y-1 leading-none'>
                      <p className='font-medium'>{user.user_metadata?.full_name || 'User'}</p>
                      <p className='w-[200px] truncate text-sm text-muted-foreground'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className='-mx-1 my-1 h-px bg-border' />
                  <Link
                    href='/profile'
                    onClick={() => setIsProfileOpen(false)}
                    className='flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground'
                  >
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Profile Settings</span>
                  </Link>
                  <Link
                    href='/emergency'
                    onClick={() => setIsProfileOpen(false)}
                    className='flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground'
                  >
                    <User className='mr-2 h-4 w-4' />
                    <span>Emergency Information</span>
                  </Link>
                  <div className='-mx-1 my-1 h-px bg-border' />
                  <button
                    type='button'
                    onClick={handleLogout}
                    className='w-full flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground text-destructive focus:text-destructive'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </button>
                </div>
              )}
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
                    <Link
                      href='/profile'
                      onClick={() => setIsOpen(false)}
                      className='text-base font-medium text-muted-foreground hover:text-primary'
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href='/emergency'
                      onClick={() => setIsOpen(false)}
                      className='text-base font-medium text-muted-foreground hover:text-primary'
                    >
                      Emergency Information
                    </Link>
                    <Button
                      variant='outline'
                      className='mt-4 justify-start text-destructive'
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      Log out
                    </Button>
                  </>
                ) : (
                  <div className='flex flex-col gap-4 mt-4'>
                    <Link
                      href='/login'
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: 'default' })}
                    >
                      Login
                    </Link>
                    <Link
                      href='/register'
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: 'outline' })}
                    >
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
