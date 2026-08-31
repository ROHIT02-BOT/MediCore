
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

export default function ProfilePage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Your profile has been updated.');
      setIsLoading(false);
    }, 1000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Password changed successfully.');
      setIsLoading(false);
    }, 1000);
  };

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
          { label: 'Medical Records', value: 0 },
          { label: 'Active Reminders', value: 0 },
          { label: 'Emergency Contacts', value: 0 },
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
                <Input id='fullName' defaultValue='User' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input id='email' type='email' disabled defaultValue='user@example.com' />
                <p className='text-[10px] text-muted-foreground'>Email cannot be changed.</p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input id='phone' type='tel' placeholder='+1 (555) 000-0000' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='dob'>Date of Birth</Label>
                <Input id='dob' type='date' />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='gender'>Gender</Label>
                <Select>
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
              <Textarea id='address' placeholder='Enter your full address' />
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
              <Label htmlFor='currentPassword'>Current Password</Label>
              <Input id='currentPassword' type='password' required />
            </div>
            <div className='space-y-2 max-w-md'>
              <Label htmlFor='newPassword'>New Password</Label>
              <Input id='newPassword' type='password' required />
            </div>
            <div className='space-y-2 max-w-md'>
              <Label htmlFor='confirmNewPassword'>Confirm New Password</Label>
              <Input id='confirmNewPassword' type='password' required />
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

