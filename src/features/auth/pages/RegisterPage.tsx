import { useAuth0 } from '@auth0/auth0-react';
import { Mic, Shield, UserCheck, Users, type LucideIcon } from 'lucide-react';

import { AppHeader } from '@/components/layout/AppHeader';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTenantDomain } from '@/providers/tenant/TenantDomainProvider';
import type { RegistrationRole } from '@/shared';

interface RoleCardDefinition {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  role: RegistrationRole;
}

const baseRoleCards: RoleCardDefinition[] = [
  {
    title: 'Student',
    description: 'Learn, explore, and grow with curated programs designed for grades 3 – 12.',
    icon: Users,
    gradient: 'from-violet-500 to-purple-500',
    role: 'student',
  },
  {
    title: 'Parent',
    description: 'Manage your child’s learning journey and stay connected with their progress.',
    icon: Mic,
    gradient: 'from-sky-500 to-cyan-500',
    role: 'parent',
  },
  {
    title: 'Volunteer',
    description: 'Support programs, events, and mentors to create lasting impact.',
    icon: UserCheck,
    gradient: 'from-amber-500 to-orange-500',
    role: 'volunteer',
  },
  {
    title: 'Administrator',
    description: 'Oversee platform operations, users, and program management.',
    icon: UserCheck,
    gradient: 'from-rose-500 to-pink-500',
    role: 'admin',
  },
];

const superAdminCard: RoleCardDefinition = {
  title: 'Super Admin',
  description: 'Full platform control including system settings and high-level administration.',
  icon: UserCheck,
  gradient: 'from-fuchsia-600 to-purple-600',
  role: 'super-admin',
};

export const RegisterPage = (): JSX.Element => {
  const { loginWithRedirect, isLoading } = useAuth0();
  const { data: tenantDomain } = useTenantDomain();

  const tenantDisplayName = tenantDomain.resolved
    ? tenantDomain.tenant?.appName?.trim() || tenantDomain.tenant?.name || 'Leapstar'
    : 'Leapstar';

  const supportEmail = tenantDomain.resolved ? (tenantDomain.tenant?.supportEmail ?? null) : null;
  const allowRegistration = tenantDomain.resolved ? tenantDomain.tenant?.status === 'active' : true;
  const tenantId = tenantDomain.resolved ? (tenantDomain.tenant?.id ?? null) : null;
  const roleCards: RoleCardDefinition[] = tenantDomain.resolved
    ? baseRoleCards
    : [...baseRoleCards, superAdminCard];

  const handleRegisterClick = (role: RegistrationRole) => {
    if (isLoading) {
      return;
    }

    const appState: Record<string, unknown> = {
      role,
      returnTo: '/register/complete',
    };

    if (tenantId) {
      appState.tenantId = tenantId;
    }

    void loginWithRedirect({
      appState,
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="gradient-text text-4xl font-semibold md:text-5xl">
            Join {tenantDisplayName}
          </h1>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Choose your role and get ready to empower the next generation.
            {supportEmail ? ` Contact ${supportEmail} if you need assistance.` : ''}
          </p>
        </div>

        {allowRegistration ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {roleCards.map(({ title, description, icon: Icon, gradient, role }) => (
              <Card
                key={title}
                role="button"
                tabIndex={0}
                aria-label={`Register as ${title}`}
                className={cn(
                  'modern-card border-primary/10 bg-card/80 shadow-lg transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-card/60',
                  isLoading
                    ? 'cursor-not-allowed opacity-70'
                    : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl',
                )}
                onClick={() => handleRegisterClick(role)}
                onKeyDown={(event) => {
                  if (event.defaultPrevented || isLoading) {
                    return;
                  }
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleRegisterClick(role);
                  }
                }}
                aria-disabled={isLoading}
              >
                <CardHeader className="text-center">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow-lg`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-12 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-destructive">
            <Shield className="mt-1 h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">Registration temporarily disabled</p>
              <p className="text-sm text-destructive/90">
                This tenant is not accepting new registrations at the moment. Please contact support
                {supportEmail ? ` at ${supportEmail}` : ''} for assistance.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
