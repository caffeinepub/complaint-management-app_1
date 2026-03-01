import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, Loader2, Shield, AlertCircle } from 'lucide-react';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const { login } = useAuth();
  const navigate = useNavigate();

  const t = {
    en: {
      title: 'PS Sadar Bazar',
      subtitle: 'Application Box',
      dept: 'Uttar Pradesh Police',
      loginHeading: 'Sign In to Your Account',
      loginSub: 'Enter your credentials to access the system',
      idLabel: 'Login ID',
      idPlaceholder: 'Enter your login ID',
      passLabel: 'Password',
      passPlaceholder: 'Enter your password',
      loginBtn: 'Sign In',
      loggingIn: 'Signing In...',
      adminHint: 'Admin: admin / admin123',
      userHint: 'User: user / user123',
    },
    hi: {
      title: 'पीएस सदर बाजार',
      subtitle: 'आवेदन बॉक्स',
      dept: 'उत्तर प्रदेश पुलिस',
      loginHeading: 'अपने खाते में साइन इन करें',
      loginSub: 'सिस्टम तक पहुंचने के लिए अपनी जानकारी दर्ज करें',
      idLabel: 'लॉगिन आईडी',
      idPlaceholder: 'अपनी लॉगिन आईडी दर्ज करें',
      passLabel: 'पासवर्ड',
      passPlaceholder: 'अपना पासवर्ड दर्ज करें',
      loginBtn: 'साइन इन करें',
      loggingIn: 'साइन इन हो रहा है...',
      adminHint: 'एडमिन: admin / admin123',
      userHint: 'यूजर: user / user123',
    },
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userId.trim() || !password.trim()) {
      setError(lang === 'en' ? 'Please enter both ID and password.' : 'कृपया आईडी और पासवर्ड दोनों दर्ज करें।');
      return;
    }
    setIsSubmitting(true);
    // Small delay for UX
    await new Promise((r) => setTimeout(r, 400));
    const result = login(userId.trim(), password);
    setIsSubmitting(false);
    if (result.success) {
      // Redirect based on role
      const stored = localStorage.getItem('ps_sadar_session');
      if (stored) {
        const sess = JSON.parse(stored);
        if (sess.role === 'admin') {
          navigate({ to: '/dashboard' });
        } else {
          navigate({ to: '/submit-complaint' });
        }
      }
    } else {
      setError(result.error ?? 'Login failed');
    }
  };

  const appId = typeof window !== 'undefined' ? encodeURIComponent(window.location.hostname) : 'ps-sadar-bazar';

  return (
    <div className="min-h-screen flex flex-col bg-login-bg">
      {/* Header */}
      <header className="nav-bg shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/15 flex items-center justify-center border border-white/30 shadow">
              <img
                src="/assets/generated/up-police-logo.dim_128x128.png"
                alt="UP Police Logo"
                className="w-9 h-9 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
                  }
                }}
              />
            </div>
            <div>
              <p className="text-nav-foreground font-serif font-bold text-base leading-tight">
                {t.title}
              </p>
              <p className="text-nav-foreground/70 text-xs">{t.dept}</p>
            </div>
          </div>
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'en' ? 'bg-white text-primary' : 'text-white/80 hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${lang === 'hi' ? 'bg-white text-primary' : 'text-white/80 hover:text-white'}`}
            >
              हिं
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-primary/20">
                <img
                  src="/assets/generated/up-police-logo.dim_128x128.png"
                  alt="UP Police Logo"
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a4a7a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
                    }
                  }}
                />
              </div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground">{t.title}</h1>
            <p className="text-lg font-semibold text-primary mt-1">{t.subtitle}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.dept}</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-card-hover border-border">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{t.loginHeading}</h2>
                  <p className="text-xs text-muted-foreground">{t.loginSub}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle size={14} />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="userId" className="text-sm font-medium">
                    {t.idLabel}
                  </Label>
                  <Input
                    id="userId"
                    type="text"
                    placeholder={t.idPlaceholder}
                    value={userId}
                    onChange={(e) => { setUserId(e.target.value); setError(''); }}
                    autoComplete="username"
                    disabled={isSubmitting}
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t.passLabel}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t.passPlaceholder}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      {t.loggingIn}
                    </>
                  ) : (
                    <>
                      <LogIn size={16} className="mr-2" />
                      {t.loginBtn}
                    </>
                  )}
                </Button>
              </form>

              {/* Demo credentials hint */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-medium mb-1">Demo Credentials:</p>
                <p className="text-xs text-muted-foreground">{t.adminHint}</p>
                <p className="text-xs text-muted-foreground">{t.userHint}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Built with{' '}
            <span className="text-destructive">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
            {' '}· © {new Date().getFullYear()} PS Sadar Bazar Application Box
          </p>
        </div>
      </footer>
    </div>
  );
}
