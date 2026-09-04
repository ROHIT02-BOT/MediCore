
'use client';

import * as React from 'react';
import { FileText, Search, Plus, Download, Edit2, Trash2, File as FileIcon, UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

const categories = ['Prescription', 'Lab Report', 'Medical Report', 'Scan', 'Diagnosis', 'Insurance', 'Other'];

export default function MedicalRecordsPage() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [records, setRecords] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  React.useEffect(() => {
    const loadRecords = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data } = await supabase
          .from('medical_records')
          .select('*')
          .eq('user_id', user.id)
          .order('record_date', { ascending: false });
        
        if (data) setRecords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecords();
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    if (!file || file.size === 0) {
      toast.error('Please select a file.');
      setIsUploading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('medical-records')
        .getPublicUrl(filePath);

      const { data: record, error: dbError } = await supabase.from('medical_records').insert({
        user_id: userId,
        title: formData.get('title'),
        category: formData.get('category'),
        doctor: formData.get('doctor') || null,
        hospital: formData.get('hospital') || null,
        record_date: formData.get('date'),
        file_url: publicUrlData.publicUrl,
        file_name: file.name,
        file_size: file.size
      }).select().single();

      if (dbError) throw dbError;

      setRecords([record, ...records]);
      toast.success('Medical record uploaded successfully.');
      setIsUploadOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error('Failed to upload record. ' + (error.message || ''));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, file_name_url: string) => {
    if (confirm('Delete this medical record?\\nThis action cannot be undone.')) {
      try {
        await supabase.from('medical_records').delete().eq('id', id);
        setRecords(records.filter(r => r.id !== id));
        toast.success('Medical record deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete record.');
      }
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          (r.doctor && r.doctor.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalSize = records.reduce((acc, curr) => acc + (curr.file_size || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const latestUpload = records.length > 0 ? format(new Date(records[0].created_at), 'MMM d, yyyy') : '-';

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading medical records...</div>;

  return (
    <div className='container mx-auto px-4 max-w-5xl py-8 space-y-8'>
      
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight mb-2'>Medical Records</h1>
          <p className='text-muted-foreground text-lg'>
            Securely store, organize, and access your medical documents.
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger>
            <Button size='lg'>
              <UploadCloud className='mr-2 h-5 w-5' />
              Upload Record
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[500px]'>
            <form onSubmit={handleUpload}>
              <DialogHeader>
                <DialogTitle>Upload Medical Record</DialogTitle>
                <DialogDescription>
                  Upload a new medical document to your secure storage.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='title'>Record Title</Label>
                  <Input id='title' name='title' required placeholder='e.g., Blood Test Results' />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='category'>Category</Label>
                  <Select name='category' required defaultValue='Medical Report'>
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                    <Label htmlFor='doctor'>Doctor (Optional)</Label>
                    <Input id='doctor' name='doctor' placeholder='Dr. Smith' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='hospital'>Hospital (Optional)</Label>
                    <Input id='hospital' name='hospital' placeholder='City Hospital' />
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='date'>Record Date</Label>
                  <Input id='date' name='date' type='date' required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='file'>Document File</Label>
                  <Input id='file' name='file' type='file' required accept='.pdf,.jpg,.jpeg,.png,.doc,.docx' />
                  <p className='text-xs text-muted-foreground'>Supported formats: PDF, JPG, PNG, DOC</p>
                </div>
              </div>
              <DialogFooter>
                <Button type='submit' disabled={isUploading} className='w-full'>
                  {isUploading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                  Upload to Secure Storage
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='bg-secondary/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{records.length}</div>
          </CardContent>
        </Card>
        <Card className='bg-secondary/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{formatBytes(totalSize)}</div>
          </CardContent>
        </Card>
        <Card className='bg-secondary/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Latest Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{latestUpload}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search records...' className='pl-9' value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={(val: string | null) => { if (val) setCategoryFilter(val); }}>
          <SelectTrigger className='w-full sm:w-[180px]'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <Card className='border-dashed shadow-none'>
          <CardContent className='flex flex-col items-center justify-center p-12 text-center'>
            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
              <FileText className='h-6 w-6 text-primary' />
            </div>
            <h2 className='text-xl font-semibold mb-2'>No medical records found</h2>
            <p className='text-muted-foreground mb-6 max-w-sm'>
              {records.length === 0 ? 'Upload your first medical document to start building your secure medical history.' : 'No records match your search criteria.'}
            </p>
            {records.length === 0 && (
              <Button onClick={() => setIsUploadOpen(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Upload Medical Record
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4'>
          {filteredRecords.map(record => (
            <Card key={record.id} className="group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <FileIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{record.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground/70">{record.category}</span>
                      <span>•</span>
                      <span>{record.record_date}</span>
                      {record.doctor && (
                        <>
                          <span>•</span>
                          <span>Dr. {record.doctor}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {record.file_url && (
                    <a href={record.file_url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                      <Download className="h-4 w-4 mr-2" /> View
                    </a>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id, record.file_url)} className="text-muted-foreground hover:text-destructive">
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

