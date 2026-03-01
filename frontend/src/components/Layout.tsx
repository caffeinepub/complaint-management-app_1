import { ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { Shield, LogOut, FileText, Users, Lock, LayoutDashboard, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { session, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation Bar */}
      <header className="nav-bar shadow-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.png"
                alt="UP Police Logo"
                className="h-10 w-10 object-contain flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <div className="text-white font-bold text-sm sm:text-base leading-tight truncate">
                  PS Sadar Bazar Application Box
                </div>
                <div className="text-saffron-400 text-xs leading-tight hidden sm:block">
                  पीएस सदर बाजार एप्लीकेशन बॉक्स - UP Police
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {isAdmin && (
                <>
                  <Link
                    to="/"
                    className="nav-link flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors hover:bg-white/10"
                    activeProps={{ className: 'nav-link active bg-white/10' }}
                  >
                    <LayoutDashboard size={15} />
                    Dashboard
                  </Link>
                  <Link
                    to="/officers"
                    className="nav-link flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors hover:bg-white/10"
                    activeProps={{ className: 'nav-link active bg-white/10' }}
                  >
                    <Users size={15} />
                    Officers / अधिकारी
                  </Link>
                  <Link
                    to="/change-password"
                    className="nav-link flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors hover:bg-white/10"
                    activeProps={{ className: 'nav-link active bg-white/10' }}
                  >
                    <Lock size={15} />
                    Change Password
                  </Link>
                </>
              )}
              {!isAdmin && (
                <Link
                  to="/submit-complaint"
                  className="nav-link flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors hover:bg-white/10"
                  activeProps={{ className: 'nav-link active bg-white/10' }}
                >
                  <FileText size={15} />
                  Submit Complaint / शिकायत दर्ज करें
                </Link>
              )}
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-white text-sm font-medium">{session?.name}</span>
                <span className="text-saffron-400 text-xs capitalize">
                  {session?.role === 'admin' ? 'Admin / एडमिन' : 'User / उपयोगकर्ता'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/10 hover:text-white flex items-center gap-1.5"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex gap-2 pb-2 overflow-x-auto">
            {isAdmin && (
              <>
                <Link
                  to="/"
                  className="nav-link flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap hover:bg-white/10"
                >
                  <LayoutDashboard size={12} /> Dashboard
                </Link>
                <Link
                  to="/officers"
                  className="nav-link flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap hover:bg-white/10"
                >
                  <Users size={12} /> Officers
                </Link>
                <Link
                  to="/change-password"
                  className="nav-link flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap hover:bg-white/10"
                >
                  <Lock size={12} /> Password
                </Link>
              </>
            )}
            {!isAdmin && (
              <Link
                to="/submit-complaint"
                className="nav-link flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap hover:bg-white/10"
              >
                <FileText size={12} /> Submit Complaint
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="nav-bar border-t border-white/10 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="UP Police" className="h-5 w-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span>© {new Date().getFullYear()} PS Sadar Bazar Application Box - UP Police</span>
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart size={12} className="text-red-400 fill-red-400 mx-0.5" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron-400 hover:text-saffron-300 underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
