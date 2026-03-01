import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Language, t } from '../lib/i18n';

type Step = 'form' | 'otp' | 'success';

export default function ChangePassword() {
  const [lang, setLang] = useState<Language>('en');
  const [step, setStep] = useState<Step>('form');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { changePassword, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      setError('Enter valid 10-digit mobile number / 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await sendOtp(mobileNumber);
      if (result.success) {
        setDemoOtp(result.otp || '');
        setStep('otp');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Enter valid 6-digit OTP / 6 अंकों का वैध OTP दर्ज करें');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await verifyOtp(mobileNumber, otp);
      if (result.success) {
        setOtpVerified(true);
        setError('');
      } else {
        setError(result.error || 'OTP verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpVerified) {
      setError('Please verify OTP first / पहले OTP सत्यापित करें');
      return;
    }
    if (newPassword.length < 6) {
      setError(t(lang, 'passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t(lang, 'passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword, mobileNumber);
      if (result.success) {
        setStep('success');
      } else {
        setError(result.error || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="shadow-card border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle size={56} className="text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-800 mb-2">
              {t(lang, 'passwordChanged')}
            </h2>
            <p className="text-gray-600 text-sm mb-2">पासवर्ड सफलतापूर्वक बदला गया</p>
            <Button
              onClick={() => navigate({ to: '/' })}
              className="mt-4 bg-navy-700 hover:bg-navy-800 text-white"
            >
              Back to Dashboard / डैशबोर्ड पर जाएं
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="govt-header rounded-t-lg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="UP Police" className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div>
            <h1 className="text-white font-bold text-lg">{t(lang, 'changePasswordTitle')}</h1>
            <p className="text-saffron-400 text-xs">पासवर्ड बदलें</p>
          </div>
        </div>
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded-full"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      <Card className="rounded-t-none shadow-card border-0 border-t-0">
        <CardContent className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label className="text-navy-800 font-medium text-sm">
                {t(lang, 'currentPassword')} / वर्तमान पासवर्ड
              </Label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={lang === 'en' ? 'Enter current password' : 'वर्तमान पासवर्ड दर्ज करें'}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Mobile Number + OTP */}
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-navy-800 font-semibold text-sm">
                <Smartphone size={16} />
                {t(lang, 'registeredMobile')} / पंजीकृत मोबाइल नंबर
              </div>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile / 10 अंकों का मोबाइल"
                  maxLength={10}
                  className="flex-1"
                  disabled={otpVerified}
                />
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || otpVerified || mobileNumber.length !== 10}
                  className="bg-navy-700 hover:bg-navy-800 text-white text-sm whitespace-nowrap"
                >
                  {t(lang, 'sendOtp')}
                </Button>
              </div>

              {step === 'otp' && !otpVerified && (
                <div className="space-y-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                    <strong>Demo OTP (Simulated):</strong> <code className="bg-white px-1 rounded font-bold text-lg">{demoOtp}</code>
                    <br />
                    <span className="text-gray-500">{t(lang, 'otpSent')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder={t(lang, 'enterOtp')}
                      maxLength={6}
                      className="flex-1 text-center text-lg font-bold tracking-widest"
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading || otp.length !== 6}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm"
                    >
                      {t(lang, 'verifyOtp')}
                    </Button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <CheckCircle size={16} />
                  {t(lang, 'otpVerified')} / OTP सत्यापित
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label className="text-navy-800 font-medium text-sm">
                {t(lang, 'newPassword')} / नया पासवर्ड
              </Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={lang === 'en' ? 'Enter new password (min 6 chars)' : 'नया पासवर्ड दर्ज करें (न्यूनतम 6 अक्षर)'}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-navy-800 font-medium text-sm">
                {t(lang, 'confirmPassword')} / पासवर्ड पुष्टि करें
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={lang === 'en' ? 'Confirm new password' : 'नया पासवर्ड पुष्टि करें'}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                className="flex-1"
              >
                Cancel / रद्द करें
              </Button>
              <Button
                type="submit"
                disabled={loading || !otpVerified}
                className="flex-1 bg-navy-700 hover:bg-navy-800 text-white font-semibold"
              >
                {loading ? (lang === 'en' ? 'Changing...' : 'बदला जा रहा है...') : `${t(lang, 'changePasswordBtn')} / पासवर्ड बदलें`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
