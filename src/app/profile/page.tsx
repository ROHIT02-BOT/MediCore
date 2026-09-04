
'use client';

import * as React from 'react';
import { User, Shield, Key, Calendar, Activity, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  
  const [userId, setUserId] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [address, setAddress] = React.useState('');

  const [counts, setCounts] = React.useState({ records: 0, reminders: 0, contacts: 0 });

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        setEmail(user.email || '');

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone || '');
          setDob(profile.date_of_birth || '');
          setGender(profile.gender || '');
          setAddress(profile.address || '');
        }

        // Fetch counts
        const [resRecords, resReminders, resContacts] = await Promise.all([
          supabase.from('medical_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('medicine_reminders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('emergency_contacts').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);

        setCounts({
          records: resRecords.count || 0,
          reminders: resReminders.count || 0,
          contacts: resContacts.count || 0
        });

      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsPageLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          full_name: fullName,
          phone: phone,
          date_of_birth: dob || null,
          gender: gender,
          address: address,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      toast.success('Your profile has been updated.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmNewPassword = formData.get('confirmNewPassword') as string;

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password changed successfully.');
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

  return (
    <div className='container mx-auto px-4 max-w-4xl py-8 space-y-8'>
      
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>Profile Settings</h1>
        <p className='text-muted-foreground text-lg'>
          Manage your account and personal information.
        </p>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-3 gap-4'>
        {[
          { label: 'Medical Records', value: counts.records },
          { label: 'Active Reminders', value: counts.reminders },
          { label: 'Emergency Contacts', value: counts.contacts },
        ].map((stat, i) => (
          <Card key={i} className='bg-secondary/30'>
            <CardContent className='p-4 text-center'>
              <div className='text-2xl font-bold text-primary mb-1'>{stat.value}</div>
              <div className='text-xs font-medium text-muted-foreground'>{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal Info */}
      <Card className='border-border/50 shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5 text-primary' />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className='space-y-4'>
            <div className='grid sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='fullName'>Full Name</Label>
                <Input id='fullName' value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input id='email' type='email' disabled value={email} />
                <p className='text-[10px] text-muted-foreground'>Email cannot be changed.</p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input id='phone' type='tel' placeholder='+1 (555) 000-0000' value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='dob'>Date of Birth</Label>
                <Input id='dob' type='date' value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='gender'>Gender</Label>
                <Select value={gender} onValueChange={(val: string | null) => { if (val) setGender(val); }}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                    <SelectItem value='prefer-not'>Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Textarea id='address' placeholder='Enter your full address' value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <Button type='submit' disabled={isLoading}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className='border-border/50 shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Key className='h-5 w-5 text-primary' />
            Change Password
          </CardTitle>
          <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className='space-y-4'>
            <div className='space-y-2 max-w-md'>
              <Label htmlFor='newPassword'>New Password</Label>
              <Input id='newPassword' name='newPassword' type='password' required minLength={6} />
            </div>
            <div className='space-y-2 max-w-md'>
              <Label htmlFor='confirmNewPassword'>Confirm New Password</Label>
              <Input id='confirmNewPassword' name='confirmNewPassword' type='password' required minLength={6} />
            </div>
            <Button type='submit' disabled={isLoading}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className='border-border/50 shadow-sm'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-muted-foreground' />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex justify-between items-center py-2 border-b'>
            <span className='text-sm text-muted-foreground'>Account status</span>
            <span className='inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400'>
              Active
            </span>
          </div>
          <div className='flex justify-between items-center py-2 border-b'>
            <span className='text-sm text-muted-foreground'>Email verification</span>
            <span className='inline-flex items-center text-sm font-medium'>
              <Check className='mr-1 h-4 w-4 text-green-500' /> Verified
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

