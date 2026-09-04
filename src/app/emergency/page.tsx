'use client';

import * as React from 'react';
import { AlertCircle, Plus, Phone, Droplet, AlertTriangle, Stethoscope, X, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function EmergencyInfoPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);

  const [bloodGroup, setBloodGroup] = React.useState('');
  
  const [allergies, setAllergies] = React.useState<any[]>([]);
  const [newAllergy, setNewAllergy] = React.useState('');

  const [conditions, setConditions] = React.useState<any[]>([]);
  const [newCondition, setNewCondition] = React.useState('');

  const [contacts, setContacts] = React.useState<any[]>([]);
  const [newContact, setNewContact] = React.useState({ name: '', relationship: '', phone: '' });

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const [resInfo, resAllergies, resConditions, resContacts] = await Promise.all([
          supabase.from('emergency_information').select('*').eq('user_id', user.id).single(),
          supabase.from('allergies').select('*').eq('user_id', user.id),
          supabase.from('medical_conditions').select('*').eq('user_id', user.id),
          supabase.from('emergency_contacts').select('*').eq('user_id', user.id)
        ]);

        if (resInfo.data?.blood_group) setBloodGroup(resInfo.data.blood_group);
        if (resAllergies.data) setAllergies(resAllergies.data);
        if (resConditions.data) setConditions(resConditions.data);
        if (resContacts.data) setContacts(resContacts.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleBloodGroupChange = async (val: string) => {
    setBloodGroup(val);
    if (!userId) return;
    try {
      await supabase.from('emergency_information').upsert({
        user_id: userId,
        blood_group: val,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      toast.success('Blood group updated.');
    } catch (e: any) {
      toast.error('Failed to update blood group.');
    }
  };

  const addAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newAllergy.trim()) return;
    const name = newAllergy.trim();
    try {
      const { data, error } = await supabase.from('allergies').insert({ user_id: userId, name }).select().single();
      if (error) throw error;
      setAllergies([...allergies, data]);
      setNewAllergy('');
      toast.success('Allergy added.');
    } catch (error: any) {
      toast.error('Failed to add allergy.');
    }
  };

  const removeAllergy = async (id: string) => {
    try {
      await supabase.from('allergies').delete().eq('id', id);
      setAllergies(allergies.filter(a => a.id !== id));
      toast.success('Allergy removed.');
    } catch (error: any) {
      toast.error('Failed to remove allergy.');
    }
  };

  const addCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newCondition.trim()) return;
    const name = newCondition.trim();
    try {
      const { data, error } = await supabase.from('medical_conditions').insert({ user_id: userId, name }).select().single();
      if (error) throw error;
      setConditions([...conditions, data]);
      setNewCondition('');
      toast.success('Medical condition added.');
    } catch (error: any) {
      toast.error('Failed to add medical condition.');
    }
  };

  const removeCondition = async (id: string) => {
    try {
      await supabase.from('medical_conditions').delete().eq('id', id);
      setConditions(conditions.filter(c => c.id !== id));
      toast.success('Condition removed.');
    } catch (error: any) {
      toast.error('Failed to remove condition.');
    }
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newContact.name || !newContact.phone) return;
    try {
      const { data, error } = await supabase.from('emergency_contacts').insert({
        user_id: userId,
        name: newContact.name,
        relationship: newContact.relationship,
        phone: newContact.phone
      }).select().single();
      if (error) throw error;
      setContacts([...contacts, data]);
      setNewContact({ name: '', relationship: '', phone: '' });
      toast.success('Emergency contact added successfully.');
    } catch (error: any) {
      toast.error('Failed to add emergency contact.');
    }
  };

  const removeContact = async (id: string) => {
    try {
      await supabase.from('emergency_contacts').delete().eq('id', id);
      setContacts(contacts.filter(c => c.id !== id));
      toast.success('Emergency contact removed.');
    } catch (error: any) {
      toast.error('Failed to remove emergency contact.');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading emergency info...</div>;

  return (
    <div className='container mx-auto px-4 max-w-4xl py-8 space-y-8'>
      
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-destructive mb-2'>Emergency Information</h1>
        <p className='text-muted-foreground text-lg'>
          Keep critical health information ready when it matters most.
        </p>
      </div>

      <div className='p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-3 border border-destructive/20'>
        <AlertCircle className='h-5 w-5 mt-0.5' />
        <div>
          <h3 className='font-semibold'>Important Information</h3>
          <p className='text-sm mt-1'>Keep your emergency information accurate and up to date. This data can be crucial for medical professionals in case of an emergency.</p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        
        {/* Blood Group */}
        <Card className='border-border/50 shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Droplet className='h-5 w-5 text-red-500' />
              Blood Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={bloodGroup} onValueChange={(val: string | null) => { if(val) handleBloodGroupChange(val); }}>
              <SelectTrigger>
                <SelectValue placeholder='Select Blood Group' />
              </SelectTrigger>
              <SelectContent>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className='border-border/50 shadow-sm flex flex-col'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-amber-500' />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-1 flex flex-col'>
            <form onSubmit={addAllergy} className='flex gap-2 mb-4'>
              <Input placeholder='Add allergy...' value={newAllergy} onChange={e => setNewAllergy(e.target.value)} />
              <Button type='submit' variant='secondary'>Add</Button>
            </form>
            <div className='flex flex-wrap gap-2'>
              {allergies.length === 0 ? (
                <p className='text-sm text-muted-foreground italic'>No allergies recorded</p>
              ) : (
                allergies.map((a: any) => (
                  <div key={a.id} className='flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm font-medium'>
                    {a.name}
                    <button onClick={() => removeAllergy(a.id)} className='text-muted-foreground hover:text-destructive transition-colors'>
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medical Conditions */}
        <Card className='border-border/50 shadow-sm md:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Stethoscope className='h-5 w-5 text-primary' />
              Medical Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addCondition} className='flex gap-2 mb-4 max-w-md'>
              <Input placeholder='Add medical condition...' value={newCondition} onChange={e => setNewCondition(e.target.value)} />
              <Button type='submit' variant='secondary'>Add</Button>
            </form>
            <div className='flex flex-wrap gap-2'>
              {conditions.length === 0 ? (
                <p className='text-sm text-muted-foreground italic'>No medical conditions recorded</p>
              ) : (
                conditions.map((c: any) => (
                  <div key={c.id} className='flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm font-medium'>
                    {c.name}
                    <button onClick={() => removeCondition(c.id)} className='text-muted-foreground hover:text-destructive transition-colors'>
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className='border-border/50 shadow-sm md:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Phone className='h-5 w-5 text-primary' />
              Emergency Contacts
            </CardTitle>
            <CardDescription>Add people to contact in case of an emergency.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addContact} className='grid sm:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-secondary/30'>
              <div className='space-y-1 sm:col-span-1'>
                <Label className='text-xs'>Name</Label>
                <Input required placeholder='Jane Doe' value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
              </div>
              <div className='space-y-1 sm:col-span-1'>
                <Label className='text-xs'>Relationship</Label>
                <Input required placeholder='Spouse' value={newContact.relationship} onChange={e => setNewContact({...newContact, relationship: e.target.value})} />
              </div>
              <div className='space-y-1 sm:col-span-1'>
                <Label className='text-xs'>Phone</Label>
                <Input required type='tel' placeholder='+1 234 567 8900' value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
              </div>
              <div className='flex items-end'>
                <Button type='submit' className='w-full'>
                  <Plus className='h-4 w-4 mr-2' /> Add
                </Button>
              </div>
            </form>

            <div className='grid gap-4 mt-8'>
              {contacts.length === 0 ? (
                <div className='text-center p-8 border border-dashed rounded-lg text-muted-foreground'>
                  <Phone className='h-8 w-8 mx-auto mb-2 opacity-20' />
                  <p>No emergency contacts added yet.</p>
                </div>
              ) : (
                contacts.map((contact: any) => (
                  <div key={contact.id} className='flex items-center justify-between p-4 border rounded-lg bg-secondary/20'>
                    <div className='flex items-start gap-3'>
                      <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold'>
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className='font-semibold'>{contact.name}</h4>
                        <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1'>
                          <span className='flex items-center gap-1'><User className='h-3.5 w-3.5' /> {contact.relationship}</span>
                          <span className='flex items-center gap-1'><Phone className='h-3.5 w-3.5' /> {contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant='ghost' size='icon' onClick={() => removeContact(contact.id)} className='text-muted-foreground hover:text-destructive'>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))
              )}
            </div>  </CardContent>
        </Card>
      </div>

    </div>
  );
}
