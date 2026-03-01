import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSubmitComplaint } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { useCamera } from '../camera/useCamera';
import { formatComplaintNumber } from '../lib/utils';
import { type Language, t } from '../lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Camera, Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FormData {
  applicantName: string;
  fatherName: string;
  address: string;
  mobileNumber: string;
  complaintDetail: string;
}

interface FormErrors {
  applicantName?: string;
  fatherName?: string;
  address?: string;
  mobileNumber?: string;
  complaintDetail?: string;
}

export default function SubmitComplaint() {
  const [lang, setLang] = useState<Language>('en');
  const [formData, setFormData] = useState<FormData>({
    applicantName: '',
    fatherName: '',
    address: '',
    mobileNumber: '',
    complaintDetail: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submittedComplaintNumber, setSubmittedComplaintNumber] = useState<bigint | null>(null);
  const [submittedMobile, setSubmittedMobile] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitMutation = useSubmitComplaint();
  const navigate = useNavigate();

  const {
    isActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: 'environment' });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.applicantName.trim()) newErrors.applicantName = t(lang, 'nameRequired');
    if (!formData.fatherName.trim()) newErrors.fatherName = t(lang, 'fatherNameRequired');
    if (!formData.address.trim()) newErrors.address = t(lang, 'addressRequired');
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = t(lang, 'mobileRequired');
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = t(lang, 'mobileInvalid');
    }
    if (!formData.complaintDetail.trim()) newErrors.complaintDetail = t(lang, 'complaintRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleOpenCamera = async () => {
    setShowCamera(true);
    await startCamera();
  };

  const handleCloseCamera = async () => {
    await stopCamera();
    setShowCamera(false);
  };

  const handleCapturePhoto = async () => {
    const file = await capturePhoto();
    if (file) {
      setAttachedFile(file);
      await stopCamera();
      setShowCamera(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let externalBlob: ExternalBlob | null = null;
      if (attachedFile) {
        const bytes = new Uint8Array(await attachedFile.arrayBuffer());
        externalBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      }

      const complaintNumber = await submitMutation.mutateAsync({
        ...formData,
        attachedFile: externalBlob,
      });

      setSubmittedMobile(formData.mobileNumber);
      setSubmittedComplaintNumber(complaintNumber);
    } catch (err) {
      console.error('Submission error:', err);
    }
  };

  const handleReset = () => {
    setFormData({
      applicantName: '',
      fatherName: '',
      address: '',
      mobileNumber: '',
      complaintDetail: '',
    });
    setAttachedFile(null);
    setUploadProgress(0);
    setSubmittedComplaintNumber(null);
    setSubmittedMobile('');
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Success Screen
  if (submittedComplaintNumber !== null) {
    const formattedNum = formatComplaintNumber(submittedComplaintNumber);
    return (
      <div className="max-w-lg mx-auto mt-6 animate-fade-in">
        <Card className="shadow-card border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-navy-800 mb-1">
              {t(lang, 'successTitle')}
            </h2>
            <p className="text-gray-600 text-sm mb-5">शिकायत सफलतापूर्वक दर्ज की गई!</p>

            <div className="bg-navy-50 border-2 border-navy-200 rounded-lg p-4 mb-5">
              <p className="text-sm text-navy-600 mb-1">
                {t(lang, 'complaintNumber')} / शिकायत संख्या
              </p>
              <p className="text-3xl font-bold text-navy-800 tracking-wider font-mono">
                {formattedNum}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5 text-sm text-green-800">
              <p>✓ {t(lang, 'smsSent')}: <strong>{submittedMobile}</strong></p>
              <p className="text-xs text-green-600 mt-1">
                ✓ आपके मोबाइल नंबर पर SMS सूचना भेजी गई है
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleReset}
                className="bg-navy-700 hover:bg-navy-800 text-white"
              >
                {t(lang, 'submitAnother')}
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/login' })}>
                {t(lang, 'backToLogin')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="govt-header rounded-t-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="UP Police"
            className="h-10 w-10 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-white font-bold text-lg">{t(lang, 'complaintForm')}</h1>
            <p className="text-saffron-400 text-xs">शिकायत पंजीकरण फॉर्म</p>
          </div>
        </div>
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-full transition-colors"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      <Card className="rounded-t-none shadow-card border-0">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Father Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-navy-800 font-medium text-sm">
                  {t(lang, 'name')} / नाम <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.applicantName}
                  onChange={(e) => {
                    setFormData({ ...formData, applicantName: e.target.value });
                    if (errors.applicantName) setErrors({ ...errors, applicantName: undefined });
                  }}
                  placeholder={lang === 'en' ? 'Full Name' : 'पूरा नाम'}
                  className={errors.applicantName ? 'border-red-400' : ''}
                />
                {errors.applicantName && (
                  <p className="text-red-500 text-xs">{errors.applicantName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-navy-800 font-medium text-sm">
                  {t(lang, 'fatherName')} / पिता का नाम <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => {
                    setFormData({ ...formData, fatherName: e.target.value });
                    if (errors.fatherName) setErrors({ ...errors, fatherName: undefined });
                  }}
                  placeholder={lang === 'en' ? "Father's Name" : 'पिता का नाम'}
                  className={errors.fatherName ? 'border-red-400' : ''}
                />
                {errors.fatherName && (
                  <p className="text-red-500 text-xs">{errors.fatherName}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="text-navy-800 font-medium text-sm">
                {t(lang, 'address')} / पता <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: undefined });
                }}
                placeholder={lang === 'en' ? 'Full Address' : 'पूरा पता'}
                rows={2}
                className={errors.address ? 'border-red-400' : ''}
              />
              {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <Label className="text-navy-800 font-medium text-sm">
                {t(lang, 'mobileNo')} / मोबाइल नंबर <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                  });
                  if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: undefined });
                }}
                placeholder="10-digit mobile number / 10 अंकों का मोबाइल नंबर"
                maxLength={10}
                className={errors.mobileNumber ? 'border-red-400' : ''}
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-xs">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Complaint Detail */}
            <div className="space-y-1.5">
              <Label className="text-navy-800 font-medium text-sm">
                {t(lang, 'complaintDetail')} / शिकायत विवरण <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={formData.complaintDetail}
                onChange={(e) => {
                  setFormData({ ...formData, complaintDetail: e.target.value });
                  if (errors.complaintDetail) setErrors({ ...errors, complaintDetail: undefined });
                }}
                placeholder={
                  lang === 'en'
                    ? 'Describe your complaint in detail...'
                    : 'अपनी शिकायत का विस्तार से वर्णन करें...'
                }
                rows={4}
                className={errors.complaintDetail ? 'border-red-400' : ''}
              />
              {errors.complaintDetail && (
                <p className="text-red-500 text-xs">{errors.complaintDetail}</p>
              )}
            </div>

            {/* File Attachment */}
            <div className="space-y-2">
              <Label className="text-navy-800 font-medium text-sm">
                {t(lang, 'attachFile')} / फ़ाइल संलग्न करें
              </Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 border-navy-300 text-navy-700 hover:bg-navy-50"
                >
                  <Upload size={16} />
                  {lang === 'en' ? 'Upload File (PDF/JPG)' : 'फ़ाइल अपलोड करें (PDF/JPG)'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenCamera}
                  className="flex items-center gap-2 border-saffron-500 text-saffron-700 hover:bg-saffron-50"
                >
                  <Camera size={16} />
                  {t(lang, 'capturePhoto')} / फ़ोटो कैप्चर करें
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {attachedFile && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-green-800">
                  <FileText size={14} />
                  <span className="flex-1 truncate">{attachedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {submitMutation.isPending && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    Uploading... {uploadProgress}% / अपलोड हो रहा है...
                  </p>
                </div>
              )}
            </div>

            {submitMutation.isError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                <AlertCircle size={16} />
                Submission failed. Please try again. / सबमिशन विफल। कृपया पुनः प्रयास करें।
              </div>
            )}

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-navy-700 hover:bg-navy-800 text-white font-semibold py-3 text-base"
            >
              {submitMutation.isPending
                ? lang === 'en'
                  ? 'Submitting...'
                  : 'दर्ज हो रहा है...'
                : `${t(lang, 'submit')} / शिकायत दर्ज करें`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Camera Dialog */}
      <Dialog
        open={showCamera}
        onOpenChange={(open) => {
          if (!open) handleCloseCamera();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-navy-800">
              <Camera size={20} />
              {t(lang, 'cameraPreview')} / कैमरा पूर्वावलोकन
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isSupported === false ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle size={40} className="mx-auto mb-2" />
                <p>
                  {t(lang, 'cameraNotSupported')} / कैमरा समर्थित नहीं है
                </p>
              </div>
            ) : (
              <>
                {cameraError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded flex items-center gap-2">
                    <AlertCircle size={16} />
                    {cameraError.type === 'permission'
                      ? `${t(lang, 'cameraAccessDenied')} / कैमरा एक्सेस अस्वीकृत`
                      : cameraError.message}
                  </div>
                )}
                <div
                  className="relative bg-black rounded-lg overflow-hidden w-full"
                  style={{ aspectRatio: '4/3', minHeight: '300px' }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {cameraLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <p className="text-white text-sm">
                        {lang === 'en' ? 'Starting camera...' : 'कैमरा शुरू हो रहा है...'}
                      </p>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-3 justify-center">
                  <Button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={!isActive || cameraLoading}
                    className="bg-navy-700 hover:bg-navy-800 text-white flex items-center gap-2"
                  >
                    <Camera size={16} />
                    {t(lang, 'takePicture')} / तस्वीर लें
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCloseCamera}>
                    Cancel / रद्द करें
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
