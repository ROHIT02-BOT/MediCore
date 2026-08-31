
'use client';

import * as React from 'react';
import { Bell, Plus, Clock, Calendar, MoreVertical, Edit2, Trash2, Pause, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function RemindersPage() {
  const [reminders, setReminders] = React.useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Reminder created successfully.');
    setIsAddOpen(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this reminder?')) {
      toast.success('Reminder deleted successfully.');
    }
  };

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
          <DialogTrigger asChild>
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
                  <Input id='medicineName' required placeholder='e.g., Amoxicillin' />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='dosage'>Dosage</Label>
                    <Input id='dosage' required placeholder='e.g., 500mg' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='frequency'>Frequency</Label>
                    <Select required>
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
                  <Input id='time' type='time' required />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='startDate'>Start Date</Label>
                    <Input id='startDate' type='date' required />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='endDate'>End Date (Optional)</Label>
                    <Input id='endDate' type='date' />
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='notes'>Notes (Optional)</Label>
                  <Textarea id='notes' placeholder='Take after meals' />
                </div>
              </div>
              <DialogFooter>
                <Button type='submit' className='w-full'>
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
            <div className='text-3xl font-bold'>0</div>
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
          {/* List items go here */}
        </div>
      )}
    </div>
  );
}

