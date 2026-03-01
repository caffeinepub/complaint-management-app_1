import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { useSubmitComplaint } from '../hooks/useQueries';
import { formatComplaintNumber } from '../lib/utils';
import { translations, Language } from '../lib/i18n';
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
  Languages,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';

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
  const [lang, setLang] = useState<Language>('en');
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successComplaintNumber, setSuccessComplaintNumber] = useState<bigint | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { session } = useAuth();
  const submitMutation = useSubmitComplaint();
  const t = translations[lang];

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.applicantName.trim()) newErrors.applicantName = t.errors.applicantName;
    if (!form.fatherName.trim()) newErrors.fatherName = t.errors.fatherName;
    if (!form.address.trim()) newErrors.address = t.errors.address;
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = t.errors.mobileNumber;
    } else if (!/^\d{10,15}$/.test(form.mobileNumber.replace(/[\s\-+]/g, ''))) {
      newErrors.mobileNumber = t.errors.mobileNumberInvalid;
    }
    if (!form.complaintDetail.trim()) newErrors.complaintDetail = t.errors.complaintDetail;
    else if (form.complaintDetail.trim().length < 20)
      newErrors.complaintDetail = t.errors.complaintDetailShort;
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
      toast.success(lang === 'en' ? 'Complaint submitted successfully!' : 'शिकायत सफलतापूर्वक दर्ज की गई!');
    } catch (err) {
      toast.error(lang === 'en' ? 'Failed to submit complaint. Please try again.' : 'शिकायत दर्ज करने में विफल। कृपया पुनः प्रयास करें।');
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
              {t.successTitle}
            </h2>
            <p className="text-muted-foreground mb-6">{t.successSubtitle}</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8 inline-block w-full">
              <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-medium">
                {t.complaintNumberLabel}
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
              <AlertTitle>{t.notificationSent}</AlertTitle>
              <AlertDescription>{t.notificationDetail}</AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => setSuccessComplaintNumber(null)}>
                {t.submitAnother}
              </Button>
              {session?.role === 'admin' && (
                <Link to="/dashboard">
                  <Button className="w-full sm:w-auto">
                    <LayoutDashboard size={16} className="mr-2" />
                    {t.viewAll}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">{t.pageTitle}</h1>
            <p className="text-muted-foreground text-sm">{t.pageSubtitle}</p>
          </div>
        </div>
        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex-shrink-0 gap-1.5"
        >
          <Languages size={14} />
          {t.langToggle}
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            {lang === 'en' ? 'Complaint Form' : 'शिकायत प्रपत्र'}
          </CardTitle>
          <CardDescription>
            {lang === 'en'
              ? 'All fields marked are required. Please fill in accurate information.'
              : 'सभी चिह्नित फ़ील्ड आवश्यक हैं। कृपया सटीक जानकारी भरें।'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Applicant Name */}
            <div className="space-y-1.5">
              <Label htmlFor="applicantName" className="flex items-center gap-1.5 text-sm font-medium">
                <User size={13} className="text-muted-foreground" />
                {t.applicantName} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="applicantName"
                placeholder={t.applicantNamePlaceholder}
                value={form.applicantName}
                onChange={(e) => handleChange('applicantName', e.target.value)}
                className={errors.applicantName ? 'border-destructive' : ''}
              />
              {errors.applicantName && (
                <p className="text-xs text-destructive">{errors.applicantName}</p>
              )}
            </div>

            {/* Father's Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fatherName" className="flex items-center gap-1.5 text-sm font-medium">
                <User size={13} className="text-muted-foreground" />
                {t.fatherName} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fatherName"
                placeholder={t.fatherNamePlaceholder}
                value={form.fatherName}
                onChange={(e) => handleChange('fatherName', e.target.value)}
                className={errors.fatherName ? 'border-destructive' : ''}
              />
              {errors.fatherName && (
                <p className="text-xs text-destructive">{errors.fatherName}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin size={13} className="text-muted-foreground" />
                {t.address} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                placeholder={t.addressPlaceholder}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && (
                <p className="text-xs text-destructive">{errors.address}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber" className="flex items-center gap-1.5 text-sm font-medium">
                <Phone size={13} className="text-muted-foreground" />
                {t.mobileNumber} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder={t.mobileNumberPlaceholder}
                value={form.mobileNumber}
                onChange={(e) => handleChange('mobileNumber', e.target.value)}
                className={errors.mobileNumber ? 'border-destructive' : ''}
              />
              {errors.mobileNumber && (
                <p className="text-xs text-destructive">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Complaint Detail */}
            <div className="space-y-1.5">
              <Label htmlFor="complaintDetail" className="flex items-center gap-1.5 text-sm font-medium">
                <ClipboardList size={13} className="text-muted-foreground" />
                {t.complaintDetail} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="complaintDetail"
                placeholder={t.complaintDetailPlaceholder}
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
                  {form.complaintDetail.length} {lang === 'en' ? 'chars' : 'अक्षर'}
                </p>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Paperclip size={13} className="text-muted-foreground" />
                {t.attachFile}
              </Label>
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t.attachFileHint}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <FileText size={20} className="text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  {t.submitButton}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
