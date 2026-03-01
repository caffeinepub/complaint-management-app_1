import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type Language, t } from '../lib/i18n';

export default function Login() {
  const [lang, setLang] = useState<Language>('en');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(userId, password);
      if (result.success) {
        // Role-based redirect
        const users = JSON.parse(localStorage.getItem('pssb_users') || '[]');
        const user = users.find((u: any) => u.userId === userId);
        const role = user?.role || 'user';
        if (role === 'admin') {
          navigate({ to: '/' });
        } else {
          navigate({ to: '/submit-complaint' });
        }
      } else {
        setError(result.error || t(lang, 'loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-bg flex flex-col items-center justify-center p-4">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-full transition-colors font-medium"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <img
                src="/logo.png"
                alt="UP Police Logo"
                className="h-20 w-20 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="h-20 w-20 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1a237e" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>';
                  }
                }}
              />
            </div>
          </div>
          <h1 className="text-white text-xl font-bold leading-tight">
            PS Sadar Bazar Application Box
          </h1>
          <h2 className="text-white text-lg font-semibold leading-tight mt-1">
            पीएस सदर बाजार एप्लीकेशन बॉक्स
          </h2>
          <p className="text-saffron-400 text-sm font-medium mt-1">
            UP Police / उत्तर प्रदेश पुलिस
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex items-center gap-2 justify-center">
              <Shield size={20} className="text-navy-700" />
              <h3 className="text-navy-800 font-bold text-lg">
                {t(lang, 'login')} / लॉगिन
              </h3>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="userId" className="text-navy-800 font-medium text-sm">
                  {t(lang, 'userId')} / यूजर आईडी
                </Label>
                <Input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={lang === 'en' ? 'Enter User ID' : 'यूजर आईडी दर्ज करें'}
                  required
                  className="border-navy-200 focus:border-navy-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-navy-800 font-medium text-sm">
                  {t(lang, 'password')} / पासवर्ड
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={lang === 'en' ? 'Enter Password' : 'पासवर्ड दर्ज करें'}
                    required
                    className="border-navy-200 focus:border-navy-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-700 hover:bg-navy-800 text-white font-semibold py-2.5"
              >
                {loading ? (lang === 'en' ? 'Logging in...' : 'लॉगिन हो रहा है...') : `${t(lang, 'loginBtn')} / लॉगिन करें`}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-5 p-3 bg-saffron-50 border border-saffron-200 rounded text-xs">
              <p className="font-semibold text-navy-800 mb-1.5">
                {t(lang, 'demoCredentials')} / डेमो क्रेडेंशियल:
              </p>
              <div className="space-y-1 text-navy-700">
                <p><span className="font-medium">Admin:</span> ID: <code className="bg-white px-1 rounded">admin</code> | Pass: <code className="bg-white px-1 rounded">admin123</code></p>
                <p><span className="font-medium">User:</span> ID: <code className="bg-white px-1 rounded">user1</code> | Pass: <code className="bg-white px-1 rounded">user123</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
