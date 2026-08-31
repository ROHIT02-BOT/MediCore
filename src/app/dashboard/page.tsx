
'use client';

import * as React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, Bell, Phone, Activity, ArrowRight, PlusCircle, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [userName, setUserName] = React.useState('User');
  const [stats, setStats] = React.useState({
    records: 0,
    reminders: 0,
    contacts: 0,
    activity: 0
  });

  React.useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] || 'User');
        // In a real app, fetch these from Supabase tables
        // For now, we mock the stats display structure
        setStats({
          records: 0,
          reminders: 0,
          contacts: 0,
          activity: 0
        });
      }
    };
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className='container mx-auto px-4 max-w-5xl py-8 space-y-10'>
      
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>
          {getGreeting()}, {userName}
        </h1>
        <p className='text-muted-foreground text-lg flex items-center gap-2'>
          Here's your health overview for {format(new Date(), 'EEEE, MMMM do, yyyy')}.
        </p>
      </div>

      {/* Health Overview Stats */}
      <section>
        <h2 className='text-lg font-semibold mb-4 text-foreground/80 tracking-tight'>HEALTH OVERVIEW</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[
            { label: 'Medical Records', value: stats.records, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Active Reminders', value: stats.reminders, icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Emergency Contacts', value: stats.contacts, icon: Phone, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'Recent Activity', value: stats.activity, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
          ].map((stat, i) => (
            <Card key={i} className='border-border/50 shadow-sm'>
              <CardContent className='p-6 flex flex-col items-start'>
                <div className={`p-3 rounded-xl ${stat.bg} mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <h3 className='text-3xl font-bold mb-1'>{stat.value}</h3>
                <p className='text-sm text-muted-foreground font-medium'>{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className='text-lg font-semibold mb-4 text-foreground/80 tracking-tight'>QUICK ACTIONS</h2>
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[
            { title: 'Upload Record', desc: 'Add new document', icon: PlusCircle, href: '/medical-records' },
            { title: 'Set Reminder', desc: 'Schedule medicine', icon: Bell, href: '/reminders' },
            { title: 'Health Tools', desc: 'BMI & Water tracker', icon: Activity, href: '/health-tools' },
            { title: 'AI Assistant', desc: 'Ask health questions', icon: MessageSquare, href: '/chatbot' },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <Card className='group cursor-pointer hover:border-primary/40 hover:shadow-md transition-all h-full'>
                <CardContent className='p-4 flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='h-10 w-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors'>
                      <action.icon className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                    </div>
                    <div>
                      <h4 className='font-semibold text-sm group-hover:text-primary transition-colors'>{action.title}</h4>
                      <p className='text-xs text-muted-foreground'>{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className='h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all' />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className='grid md:grid-cols-2 gap-8'>
        {/* Today/Upcoming */}
        <section>
          <h2 className='text-lg font-semibold mb-4 text-foreground/80 tracking-tight'>TODAY / UPCOMING</h2>
          <Card className='border-border/50 shadow-sm min-h-[250px] flex flex-col'>
            <CardContent className='flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground'>
              <Bell className='h-10 w-10 mb-4 opacity-20' />
              <p className='mb-4'>No upcoming medications or events for today.</p>
              <Button variant='outline' size='sm' asChild>
                <Link href='/reminders'>
                  <Plus className='mr-2 h-4 w-4' /> Add Reminder
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className='text-lg font-semibold mb-4 text-foreground/80 tracking-tight'>RECENT ACTIVITY</h2>
          <Card className='border-border/50 shadow-sm min-h-[250px] flex flex-col'>
            <CardContent className='flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground'>
              <Activity className='h-10 w-10 mb-4 opacity-20' />
              <h3 className='font-medium text-foreground mb-1'>No activity yet</h3>
              <p className='mb-4 text-sm'>Your recent health activity will appear here.</p>
              <Button variant='default' size='sm' asChild>
                <Link href='/medical-records'>
                  <Plus className='mr-2 h-4 w-4' /> Upload Your First Record
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

