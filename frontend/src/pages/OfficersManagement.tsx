import { useState } from 'react';
import { toast } from 'sonner';
import { useListOfficers, useAddOfficer } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserPlus,
  Phone,
  Briefcase,
  Hash,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfficerForm {
  officerId: string;
  name: string;
  mobileNumber: string;
  designation: string;
}

const initialForm: OfficerForm = {
  officerId: '',
  name: '',
  mobileNumber: '',
  designation: '',
};

export default function OfficersManagement() {
  const [form, setForm] = useState<OfficerForm>(initialForm);
  const [errors, setErrors] = useState<Partial<OfficerForm>>({});

  const { data: officers, isLoading, isError, refetch, isFetching } = useListOfficers();
  const addMutation = useAddOfficer();

  const validate = (): boolean => {
    const newErrors: Partial<OfficerForm> = {};
    if (!form.officerId.trim()) newErrors.officerId = 'Officer ID is required';
    else if (!/^[A-Za-z0-9_-]+$/.test(form.officerId)) newErrors.officerId = 'Only letters, numbers, hyphens, underscores allowed';
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10,15}$/.test(form.mobileNumber.replace(/[\s\-+]/g, ''))) {
      newErrors.mobileNumber = 'Enter a valid mobile number';
    }
    if (!form.designation.trim()) newErrors.designation = 'Designation is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof OfficerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Check for duplicate officer ID
    if (officers?.some((o) => o.officerId === form.officerId.trim())) {
      setErrors((prev) => ({ ...prev, officerId: 'This Officer ID already exists' }));
      return;
    }

    try {
      await addMutation.mutateAsync({
        officerId: form.officerId.trim(),
        name: form.name.trim(),
        mobileNumber: form.mobileNumber.trim(),
        designation: form.designation.trim(),
      });
      toast.success(`Officer "${form.name}" added successfully!`);
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      toast.error('Failed to add officer. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Officers Management</h1>
          <p className="text-muted-foreground text-sm">Register and manage complaint handling officers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Officer Form */}
        <div className="lg:col-span-1">
          <Card className="shadow-card sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus size={16} className="text-primary" />
                Add New Officer
              </CardTitle>
              <CardDescription>Register a new officer to handle complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="officerId">
                    <Hash size={12} className="inline mr-1 text-muted-foreground" />
                    Officer ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="officerId"
                    placeholder="e.g. OFF-001"
                    value={form.officerId}
                    onChange={(e) => handleChange('officerId', e.target.value)}
                    className={cn(errors.officerId && 'border-destructive')}
                  />
                  {errors.officerId && (
                    <p className="text-xs text-destructive">{errors.officerId}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="officerName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="officerName"
                    placeholder="Enter officer's full name"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={cn(errors.name && 'border-destructive')}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="officerMobile">
                    <Phone size={12} className="inline mr-1 text-muted-foreground" />
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="officerMobile"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.mobileNumber}
                    onChange={(e) => handleChange('mobileNumber', e.target.value)}
                    className={cn(errors.mobileNumber && 'border-destructive')}
                  />
                  {errors.mobileNumber && (
                    <p className="text-xs text-destructive">{errors.mobileNumber}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="designation">
                    <Briefcase size={12} className="inline mr-1 text-muted-foreground" />
                    Designation <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="designation"
                    placeholder="e.g. Senior Inspector"
                    value={form.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    className={cn(errors.designation && 'border-destructive')}
                  />
                  {errors.designation && (
                    <p className="text-xs text-destructive">{errors.designation}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Adding Officer...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} className="mr-2" />
                      Add Officer
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Officers List */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    Registered Officers
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {officers ? `${officers.length} officer${officers.length !== 1 ? 's' : ''} registered` : 'Loading...'}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw size={14} className={cn('mr-1.5', isFetching && 'animate-spin')} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-md" />
                  ))}
                </div>
              ) : isError ? (
                <div className="p-10 text-center">
                  <AlertCircle size={36} className="mx-auto mb-3 text-destructive/50" />
                  <p className="text-muted-foreground text-sm">Failed to load officers.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              ) : !officers || officers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={40} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="font-medium text-foreground mb-1">No officers registered</p>
                  <p className="text-sm text-muted-foreground">
                    Use the form on the left to add your first officer.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="font-semibold text-foreground">Officer ID</TableHead>
                        <TableHead className="font-semibold text-foreground">Name</TableHead>
                        <TableHead className="font-semibold text-foreground hidden sm:table-cell">Mobile</TableHead>
                        <TableHead className="font-semibold text-foreground">Designation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {officers.map((officer) => (
                        <TableRow key={officer.officerId} className="hover:bg-accent/30">
                          <TableCell className="font-mono text-sm font-semibold text-primary">
                            {officer.officerId}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {officer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium text-sm text-foreground">{officer.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {officer.mobileNumber}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-xs font-medium">
                              <Briefcase size={11} />
                              {officer.designation}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
