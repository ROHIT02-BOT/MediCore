
'use client';

import * as React from 'react';
import { Bell, Plus, Clock, Calendar, MoreVertical, Edit2, Trash2, Pause, Play, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function RemindersPage() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [reminders, setReminders] = React.useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const loadReminders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        const { data } = await supabase.from('medicine_reminders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setReminders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadReminders();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      const { data, error } = await supabase.from('medicine_reminders').insert({
        user_id: userId,
        medicine_name: formData.get('medicineName'),
        dosage: formData.get('dosage'),
        frequency: formData.get('frequency'),
        reminder_times: [formData.get('time')],
        start_date: formData.get('startDate'),
        end_date: formData.get('endDate') || null,
        notes: formData.get('notes') || null,
        is_active: true
      }).select().single();
      
      if (error) throw error;
      setReminders([data, ...reminders]);
      toast.success('Reminder created successfully.');
      setIsAddOpen(false);
    } catch (error: any) {
      toast.error('Failed to create reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this reminder?')) {
      try {
        await supabase.from('medicine_reminders').delete().eq('id', id);
        setReminders(reminders.filter(r => r.id !== id));
        toast.success('Reminder deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete reminder.');
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from('medicine_reminders').update({ is_active: !currentStatus }).eq('id', id);
      setReminders(reminders.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r));
      toast.success(`Reminder ${!currentStatus ? 'activated' : 'paused'}.`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading reminders...</div>;

  const activeCount = reminders.filter(r => r.is_active).length;

  return (
    <div className='container mx-auto px-4 max-w-5xl py-8 space-y-8'>
      
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight mb-2'>Medicine Reminders</h1>
          <p className='text-muted-foreground text-lg'>
            Stay on schedule with your medications.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger>
            <Button size='lg'>
              <Plus className='mr-2 h-5 w-5' />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[500px]'>
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Add Medication Reminder</DialogTitle>
                <DialogDescription>
                  Set up a new reminder to take your medicine.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='medicineName'>Medicine Name</Label>
                  <Input id='medicineName' name='medicineName' required placeholder='e.g., Amoxicillin' />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='dosage'>Dosage</Label>
                    <Input id='dosage' name='dosage' required placeholder='e.g., 500mg' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='frequency'>Frequency</Label>
                    <Select name='frequency' required defaultValue='once'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='once'>Once Daily</SelectItem>
                        <SelectItem value='twice'>Twice Daily</SelectItem>
                        <SelectItem value='thrice'>Three Times Daily</SelectItem>
                        <SelectItem value='weekly'>Weekly</SelectItem>
                        <SelectItem value='custom'>Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='time'>Reminder Time</Label>
                  <Input id='time' name='time' type='time' required />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='startDate'>Start Date</Label>
                    <Input id='startDate' name='startDate' type='date' required />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='endDate'>End Date (Optional)</Label>
                    <Input id='endDate' name='endDate' type='date' />
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='notes'>Notes (Optional)</Label>
                  <Textarea id='notes' name='notes' placeholder='Take after meals' />
                </div>
              </div>
              <DialogFooter>
                <Button type='submit' disabled={isSubmitting} className='w-full'>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Reminder
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Card className='bg-secondary/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{reminders.length}</div>
          </CardContent>
        </Card>
        <Card className='bg-secondary/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Active Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{activeCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <Card className='border-dashed shadow-none'>
          <CardContent className='flex flex-col items-center justify-center p-12 text-center'>
            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
              <Bell className='h-6 w-6 text-primary' />
            </div>
            <h2 className='text-xl font-semibold mb-2'>No reminders yet</h2>
            <p className='text-muted-foreground mb-6 max-w-sm'>
              Create your first medication reminder to stay on schedule.
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Add Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={`${!reminder.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${reminder.is_active ? 'bg-amber-500/10 text-amber-500' : 'bg-secondary text-muted-foreground'}`}>
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{reminder.medicine_name} <span className="text-sm font-normal text-muted-foreground ml-2">{reminder.dosage}</span></h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {reminder.reminder_times[0] || 'Set time'}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {reminder.frequency}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleActive(reminder.id, reminder.is_active)}>
                    {reminder.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

