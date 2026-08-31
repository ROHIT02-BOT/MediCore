'use client';

import * as React from 'react';
import { AlertCircle, Plus, Phone, Droplet, AlertTriangle, Stethoscope, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function EmergencyInfoPage() {
  const [bloodGroup, setBloodGroup] = React.useState('');
  
  const [allergies, setAllergies] = React.useState<string[]>(['Penicillin']);
  const [newAllergy, setNewAllergy] = React.useState('');

  const [conditions, setConditions] = React.useState<string[]>([]);
  const [newCondition, setNewCondition] = React.useState('');

  const [contacts, setContacts] = React.useState<any[]>([]);
  const [newContact, setNewContact] = React.useState({ name: '', relationship: '', phone: '' });

  const addAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
      toast.success('Allergy added.');
    }
  };

  const addCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
      toast.success('Medical condition added.');
    }
  };

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name && newContact.phone) {
      setContacts([...contacts, { ...newContact, id: Date.now() }]);
      setNewContact({ name: '', relationship: '', phone: '' });
      toast.success('Emergency contact added successfully.');
    }
  };

  const removeContact = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast.success('Emergency contact removed.');
  };

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
            <Select value={bloodGroup} onValueChange={(val) => { setBloodGroup(val); toast.success('Blood group updated.'); }}>
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
                allergies.map(a => (
                  <div key={a} className='flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm font-medium'>
                    {a}
                    <button onClick={() => setAllergies(allergies.filter(x => x !== a))} className='text-muted-foreground hover:text-destructive transition-colors'>
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
                conditions.map(c => (
                  <div key={c} className='flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm font-medium'>
                    {c}
                    <button onClick={() => setConditions(conditions.filter(x => x !== c))} className='text-muted-foreground hover:text-destructive transition-colors'>
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

            {contacts.length === 0 ? (
              <div className='text-center py-6 border-2 border-dashed rounded-lg'>
                <Phone className='h-8 w-8 text-muted-foreground/30 mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>No emergency contacts added</p>
              </div>
            ) : (
              <div className='grid sm:grid-cols-2 gap-4'>
                {contacts.map(contact => (
                  <div key={contact.id} className='flex items-center justify-between p-4 border rounded-lg bg-card'>
                    <div>
                      <div className='font-semibold'>{contact.name}</div>
                      <div className='text-sm text-muted-foreground flex items-center gap-2'>
                        <span className='capitalize'>{contact.relationship}</span>
                        <span>•</span>
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                    <Button variant='ghost' size='icon' className='text-muted-foreground hover:text-destructive' onClick={() => removeContact(contact.id)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
