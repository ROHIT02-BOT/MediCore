import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, FileText, Bell, Activity, MessageSquare, Lock, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      {/* Hero Section */}
      <section className='relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1 flex items-center'>
        <div className='absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 pointer-events-none' />
        <div className='container mx-auto px-4 max-w-5xl relative z-10 text-center flex flex-col items-center'>
          <div className='inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6'>
            <Shield className='h-3.5 w-3.5 mr-1 text-primary' />
            Designed with privacy in mind
          </div>
          <h1 className='text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6'>
            Your Health.<br />
            <span className='text-primary'>Securely Managed.</span>
          </h1>
          <p className='mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed'>
            SecureMed helps you securely organize your medical records, medication reminders, emergency information, and everyday health tools in one place.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center'>
            <Button size='lg' className='h-12 px-8 text-base group' asChild>
              <Link href='/register'>
                Get Started
                <ChevronRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
              </Link>
            </Button>
            <Button size='lg' variant='outline' className='h-12 px-8 text-base' asChild>
              <Link href='/login'>Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className='py-20 bg-secondary/30'>
        <div className='container mx-auto px-4 max-w-6xl'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold tracking-tight mb-4'>Everything you need for your health journey</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto text-lg'>
              A comprehensive suite of tools designed to make managing your healthcare simple, secure, and intuitive.
            </p>
          </div>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[
              { icon: FileText, title: 'Secure Medical Records', desc: 'Store, organize, and access your medical documents anytime.' },
              { icon: Bell, title: 'Medicine Reminders', desc: 'Never miss a dose with our intelligent medication schedule.' },
              { icon: Activity, title: 'Health Tools', desc: 'Track your BMI, daily water intake, and general wellness.' },
              { icon: Shield, title: 'Emergency Information', desc: 'Keep critical health information ready when it matters most.' },
              { icon: MessageSquare, title: 'AI Health Assistant', desc: 'Get helpful answers to general health and wellness questions.' },
              { icon: Lock, title: 'Secure Account', desc: 'Your data is protected using enterprise-grade authentication.' },
            ].map((feature, i) => (
              <Card key={i} className='border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20 group'>
                <CardContent className='p-6 flex flex-col items-start'>
                  <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                    <feature.icon className='h-6 w-6 text-primary group-hover:text-white transition-colors' />
                  </div>
                  <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
                  <p className='text-muted-foreground'>{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className='py-24 relative overflow-hidden'>
        <div className='container mx-auto px-4 max-w-4xl text-center'>
          <Lock className='h-12 w-12 text-muted-foreground/30 mx-auto mb-6' />
          <h2 className='text-3xl font-bold mb-6'>Your privacy is our priority</h2>
          <p className='text-xl text-muted-foreground leading-relaxed'>
            We believe your health data belongs to you. That is why SecureMed is built on Supabase with robust row-level security policies ensuring your information remains private and accessible only to you.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t py-12 bg-card'>
        <div className='container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-primary' />
            <span className='font-semibold text-lg'>SecureMed</span>
          </div>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} SecureMed. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
