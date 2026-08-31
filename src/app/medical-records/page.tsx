
'use client';

import * as React from 'react';
import { FileText, Search, Plus, Download, Edit2, Trash2, File as FileIcon, UploadCloud, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Mock data structure
const categories = ['Prescription', 'Lab Report', 'Medical Report', 'Scan', 'Diagnosis', 'Insurance', 'Other'];

export default function MedicalRecordsPage() {
  const [records, setRecords] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

  // In a real app, fetch from Supabase
  // useEffect(() => { loadRecords() }, [])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock upload
    setTimeout(() => {
      toast.success('Medical record uploaded successfully.');
      setIsLoading(false);
      setIsUploadOpen(false);
    }, 1000);
  };

  const handleDelete = () => {
    if (confirm('Delete this medical record?\nThis action cannot be undone.')) {
      toast.success('Medical record deleted successfully.');
    }
  };

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
          <DialogTrigger asChild>
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
                  <Input id='title' required placeholder='e.g., Blood Test Results' />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='category'>Category</Label>
                  <Select required>
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
                    <Input id='doctor' placeholder='Dr. Smith' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='hospital'>Hospital (Optional)</Label>
                    <Input id='hospital' placeholder='City Hospital' />
                  </div>
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='date'>Record Date</Label>
                  <Input id='date' type='date' required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='file'>Document File</Label>
                  <Input id='file' type='file' required accept='.pdf,.jpg,.jpeg,.png,.doc,.docx' />
                  <p className='text-xs text-muted-foreground'>Supported formats: PDF, JPG, PNG, DOC</p>
                </div>
              </div>
              <DialogFooter>
                <Button type='submit' disabled={isLoading} className='w-full'>
                  {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
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
            <div className='text-3xl font-bold'>0 MB</div>
          </CardContent>
        </Card>
        <Card className='bg-secondary/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Latest Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>-</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search records...' className='pl-9' />
        </div>
        <Select>
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
      {records.length === 0 ? (
        <Card className='border-dashed shadow-none'>
          <CardContent className='flex flex-col items-center justify-center p-12 text-center'>
            <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
              <FileText className='h-6 w-6 text-primary' />
            </div>
            <h2 className='text-xl font-semibold mb-2'>No medical records yet</h2>
            <p className='text-muted-foreground mb-6 max-w-sm'>
              Upload your first medical document to start building your secure medical history.
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Upload Medical Record
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4'>
          {/* Example item if there were records */}
        </div>
      )}

    </div>
  );
}

