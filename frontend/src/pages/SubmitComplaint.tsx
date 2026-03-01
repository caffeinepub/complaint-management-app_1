import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { useSubmitComplaint } from '../hooks/useQueries';
import { formatComplaintNumber } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  FileText,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  User,
  Phone,
  MapPin,
  ClipboardList,
  Paperclip,
  LayoutDashboard,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface FormData {
  applicantName: string;
  fatherName: string;
  address: string;
  mobileNumber: string;
  complaintDetail: string;
}

const initialForm: FormData = {
  applicantName: '',
  fatherName: '',
  address: '',
  mobileNumber: '',
  complaintDetail: '',
};

export default function SubmitComplaint() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successComplaintNumber, setSuccessComplaintNumber] = useState<bigint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useSubmitComplaint();

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.applicantName.trim()) newErrors.applicantName = 'Applicant name is required';
    if (!form.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10,15}$/.test(form.mobileNumber.replace(/[\s\-+]/g, ''))) {
      newErrors.mobileNumber = 'Enter a valid mobile number';
    }
    if (!form.complaintDetail.trim()) newErrors.complaintDetail = 'Complaint detail is required';
    else if (form.complaintDetail.trim().length < 20) newErrors.complaintDetail = 'Please provide more detail (at least 20 characters)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Only PDF and JPG files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let attachedFile: ExternalBlob | null = null;

    if (selectedFile) {
      const bytes = new Uint8Array(await selectedFile.arrayBuffer());
      attachedFile = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
    }

    try {
      const complaintNumber = await submitMutation.mutateAsync({
        ...form,
        attachedFile,
      });
      setSuccessComplaintNumber(complaintNumber);
      setForm(initialForm);
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Complaint submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit complaint. Please try again.');
      console.error(err);
    }
  };

  if (successComplaintNumber !== null) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="shadow-card border-success/30">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 size={44} className="text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Complaint Submitted Successfully
            </h2>
            <p className="text-muted-foreground mb-6">
              Your complaint has been registered. Please save your complaint number for future reference.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8 inline-block w-full">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">
                Your Complaint Number
              </p>
              <p className="text-3xl font-bold text-primary font-mono tracking-widest">
                {formatComplaintNumber(successComplaintNumber)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                (Reference ID: {successComplaintNumber.toString()})
              </p>
            </div>
            <Alert className="text-left mb-6 bg-accent/50">
              <CheckCircle2 size={16} className="text-success" />
              <AlertTitle>Notification Sent</AlertTitle>
              <AlertDescription>
                A confirmation message has been recorded in the system. An officer will be assigned to your complaint shortly.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setSuccessComplaintNumber(null)}
              >
                Submit Another Complaint
              </Button>
              <Link to="/dashboard">
                <Button className="w-full sm:w-auto">
                  <LayoutDashboard size={16} className="mr-2" />
                  View All Complaints
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Submit a Complaint</h1>
            <p className="text-muted-foreground text-sm">Fill in the details below to register your complaint</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Applicant Information */}
        <Card className="shadow-card mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <User size={16} className="text-primary" />
              Applicant Information
            </CardTitle>
            <CardDescription>Personal details of the complainant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="applicantName">
                  Applicant Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="applicantName"
                  placeholder="Enter full name"
                  value={form.applicantName}
                  onChange={(e) => handleChange('applicantName', e.target.value)}
                  className={errors.applicantName ? 'border-destructive' : ''}
                />
                {errors.applicantName && (
                  <p className="text-xs text-destructive">{errors.applicantName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fatherName">
                  Father's Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fatherName"
                  placeholder="Enter father's name"
                  value={form.fatherName}
                  onChange={(e) => handleChange('fatherName', e.target.value)}
                  className={errors.fatherName ? 'border-destructive' : ''}
                />
                {errors.fatherName && (
                  <p className="text-xs text-destructive">{errors.fatherName}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">
                <MapPin size={13} className="inline mr-1 text-muted-foreground" />
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                placeholder="Enter complete address"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber">
                <Phone size={13} className="inline mr-1 text-muted-foreground" />
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                className={errors.mobileNumber ? 'border-destructive' : ''}
              />
              {errors.mobileNumber && (
                <p className="text-xs text-destructive">{errors.mobileNumber}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complaint Details */}
        <Card className="shadow-card mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              Complaint Details
            </CardTitle>
            <CardDescription>Describe your complaint in detail</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="complaintDetail">
                Complaint Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="complaintDetail"
                placeholder="Describe your complaint in detail (minimum 20 characters)..."
                value={form.complaintDetail}
                onChange={(e) => handleChange('complaintDetail', e.target.value)}
                rows={5}
                className={errors.complaintDetail ? 'border-destructive' : ''}
              />
              <div className="flex justify-between items-center">
                {errors.complaintDetail ? (
                  <p className="text-xs text-destructive">{errors.complaintDetail}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {form.complaintDetail.length} characters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Attachment */}
        <Card className="shadow-card mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Paperclip size={16} className="text-primary" />
              Attach Supporting Document
            </CardTitle>
            <CardDescription>Optional: Attach a PDF or JPG file (max 10MB)</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF or JPG files only (max 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-accent/40 rounded-lg border border-border">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {selectedFile.type === 'application/pdf' ? (
                    <FileText size={20} className="text-primary" />
                  ) : (
                    <Paperclip size={20} className="text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull;{' '}
                    {selectedFile.type === 'application/pdf' ? 'PDF Document' : 'JPEG Image'}
                  </p>
                  {submitMutation.isPending && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(initialForm);
              setErrors({});
              setSelectedFile(null);
            }}
            disabled={submitMutation.isPending}
          >
            Reset Form
          </Button>
          <Button type="submit" disabled={submitMutation.isPending} className="min-w-[160px]">
            {submitMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <ClipboardList size={16} className="mr-2" />
                Submit Complaint
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
