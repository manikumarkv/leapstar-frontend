import { useAuth0 } from '@auth0/auth0-react';
import { LineChart, Loader2, LogIn, LogOut, Sparkles, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useTenantDomain } from '@/providers/tenant/TenantDomainProvider';

const primaryLinks = [{ label: 'Insights', href: '/insights', icon: LineChart }];

export const AppHeader = (): JSX.Element => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();
  const { data: tenantDomain } = useTenantDomain();
  const navigate = useNavigate();
  const logoutReturnTo =
    typeof window !== 'undefined'
      ? `${window.location.origin.replace(/\/$/, '')}/logout`
      : undefined;

  const handleSignIn = async () => {
    await loginWithRedirect();
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleSignOut = () => {
    if (logoutReturnTo) {
      void logout({ logoutParams: { returnTo: logoutReturnTo } });
    } else {
      void logout();
    }
  };

  const tenantDisplayName = tenantDomain.resolved
    ? tenantDomain.tenant?.appName?.trim() || tenantDomain.tenant?.name || 'Leapstar'
    : 'Leapstar';
  const tenantTagline = tenantDomain.resolved
    ? `Learning portal for ${tenantDomain.tenant?.name ?? tenantDisplayName}`
    : 'Empower every learning journey';
  const registrationDisabled = tenantDomain.resolved && tenantDomain.tenant?.status !== 'active';

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold leading-none gradient-text">
                {tenantDisplayName}
              </span>
              <span className="text-xs text-muted-foreground">{tenantTagline}</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {primaryLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                to={href}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <div className="hidden flex-col text-right text-sm md:flex">
                <span className="font-semibold leading-tight">{user?.name ?? user?.email}</span>
                {user?.email ? (
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                ) : null}
              </div>
              <Button
                variant="secondary"
                className="hidden items-center gap-2 md:inline-flex"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden items-center gap-2 font-medium md:inline-flex"
                onClick={handleRegister}
                disabled={isLoading || registrationDisabled}
              >
                <UserPlus className="h-4 w-4" />
                Register
              </Button>
              <Button
                className="inline-flex items-center gap-2 font-semibold"
                onClick={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Sign in
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
