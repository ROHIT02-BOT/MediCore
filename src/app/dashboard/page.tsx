
'use client';

import * as React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, Bell, Phone, Activity, ArrowRight, PlusCircle, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [userName, setUserName] = React.useState('User');
  const [userId, setUserId] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState({
    records: 0,
    reminders: 0,
    contacts: 0,
    activity: 0
  });

  const [upcomingReminders, setUpcomingReminders] = React.useState<any[]>([]);
  const [recentRecords, setRecentRecords] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Get profile name if exists, else fallback to metadata or 'User'
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
          setUserName(profile?.full_name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || 'User');
          
          // Fetch stats
          const [resRecords, resReminders, resContacts] = await Promise.all([
            supabase.from('medical_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('medicine_reminders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
            supabase.from('emergency_contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
          ]);

          const recordsCount = resRecords.count || 0;
          const remindersCount = resReminders.count || 0;
          const contactsCount = resContacts.count || 0;
          
          // Fetch upcoming reminders (active ones)
          const { data: reminders } = await supabase
            .from('medicine_reminders')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .limit(3);
            
          if (reminders) setUpcomingReminders(reminders);

          // Fetch recent records
          const { data: records } = await supabase
            .from('medical_records')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3);
            
          if (records) setRecentRecords(records);

          setStats({
            records: recordsCount,
            reminders: remindersCount,
            contacts: contactsCount,
            activity: recordsCount + remindersCount
          });
        }
      } catch (err) {
        console.error(err);
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
            {upcomingReminders.length === 0 ? (
              <CardContent className='flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground'>
                <Bell className='h-10 w-10 mb-4 opacity-20' />
                <p className='mb-4'>No upcoming medications or events for today.</p>
                <Link href='/reminders' className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  <Plus className='mr-2 h-4 w-4' /> Add Reminder
                </Link>
              </CardContent>
            ) : (
              <CardContent className='flex-1 p-0 flex flex-col'>
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className='flex items-center justify-between p-4 border-b last:border-0'>
                    <div>
                      <h4 className='font-semibold'>{reminder.medicine_name}</h4>
                      <p className='text-sm text-muted-foreground'>{reminder.dosage} - {reminder.frequency}</p>
                    </div>
                    <div className='text-sm font-medium bg-amber-500/10 text-amber-600 px-2 py-1 rounded'>
                      {reminder.reminder_times[0] || 'Set time'}
                    </div>
                  </div>
                ))}
                <div className='p-4 mt-auto text-center border-t'>
                  <Link href='/reminders' className='text-sm font-medium text-primary hover:underline'>
                    View All Reminders
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className='text-lg font-semibold mb-4 text-foreground/80 tracking-tight'>RECENT ACTIVITY</h2>
          <Card className='border-border/50 shadow-sm min-h-[250px] flex flex-col'>
            {recentRecords.length === 0 ? (
              <CardContent className='flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground'>
                <Activity className='h-10 w-10 mb-4 opacity-20' />
                <h3 className='font-medium text-foreground mb-1'>No activity yet</h3>
                <p className='mb-4 text-sm'>Your recent health activity will appear here.</p>
                <div className='flex gap-2 w-full sm:w-auto'>
                  <Link href='/medical-records' className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    View Records
                  </Link>
                  <Link href='/reminders' className={buttonVariants({ variant: 'default', size: 'sm' })}>
                    <Plus className='h-4 w-4 mr-1' /> Add Reminder
                  </Link>
                </div>
              </CardContent>
            ) : (
              <CardContent className='flex-1 p-0 flex flex-col'>
                {recentRecords.map((record) => (
                  <div key={record.id} className='flex items-center gap-4 p-4 border-b last:border-0'>
                    <div className='h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500'>
                      <FileText className='h-5 w-5' />
                    </div>
                    <div>
                      <h4 className='font-semibold'>{record.title}</h4>
                      <p className='text-xs text-muted-foreground'>Uploaded on {record.record_date}</p>
                    </div>
                  </div>
                ))}
                <div className='p-4 mt-auto text-center border-t'>
                  <Link href='/medical-records' className='text-sm font-medium text-primary hover:underline'>
                    View All Records
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

