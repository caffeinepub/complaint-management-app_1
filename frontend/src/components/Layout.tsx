import { ReactNode, useState } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { FileText, LayoutDashboard, Users, Menu, X, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

const adminNavLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/submit-complaint', label: 'Submit Complaint', icon: FileText },
  { to: '/officers', label: 'Officers', icon: Users },
];

const userNavLinks = [
  { to: '/submit-complaint', label: 'Submit Complaint', icon: FileText },
];

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = session?.role === 'admin' ? adminNavLinks : userNavLinks;

  const appId =
    typeof window !== 'undefined'
      ? encodeURIComponent(window.location.hostname)
      : 'ps-sadar-bazar';

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="nav-bg shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link
              to={session?.role === 'admin' ? '/dashboard' : '/submit-complaint'}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/30 shadow-sm">
                <img
                  src="/assets/generated/up-police-logo.dim_128x128.png"
                  alt="UP Police Logo"
                  className="w-9 h-9 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
                    }
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-nav-foreground font-serif font-bold text-sm leading-tight tracking-tight">
                  PS Sadar Bazar
                </p>
                <p className="text-nav-foreground/65 text-xs tracking-wide">Application Box · UP Police</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {session && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label, icon: Icon }) => {
                  const isActive =
                    currentPath === to || currentPath.startsWith(to + '/');
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right side: role badge + logout */}
            <div className="hidden md:flex items-center gap-2">
              {session && (
                <>
                  <Badge
                    variant="outline"
                    className="border-white/30 text-white/90 bg-white/10 text-xs"
                  >
                    {session.role === 'admin' ? '🛡 Admin' : '👤 User'}
                  </Badge>
                  <span className="text-white/60 text-xs hidden lg:block">{session.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 h-8"
                  >
                    <LogOut size={14} />
                    Logout
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            {/* Mobile brand name */}
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <img
                src="/assets/generated/up-police-logo.dim_128x128.png"
                alt="UP Police Logo"
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-nav-foreground font-serif font-bold text-sm">
                PS Sadar Bazar Application Box
              </span>
            </div>
            {session && (
              <div className="px-4 py-2 space-y-1">
                {navLinks.map(({ to, label, icon: Icon }) => {
                  const isActive = currentPath === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  );
                })}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-white/30 text-white/90 bg-white/10 text-xs"
                    >
                      {session.role === 'admin' ? '🛡 Admin' : '👤 User'}
                    </Badge>
                    <span className="text-white/70 text-xs">{session.name}</span>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Shield size={14} className="text-primary" />
              <span>PS Sadar Bazar Application Box &copy; {new Date().getFullYear()}</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Built with <span className="text-destructive">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
