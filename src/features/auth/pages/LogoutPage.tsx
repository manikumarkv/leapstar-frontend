import { useAuth0 } from '@auth0/auth0-react';
import { CheckCircle2, Home, LogIn } from 'lucide-react';

import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';

export const LogoutPage = (): JSX.Element => {
  const { loginWithRedirect } = useAuth0();

  const handleSignIn = async () => {
    await loginWithRedirect();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 py-16">
        <div className="modern-card mx-auto max-w-xl animate-fade-in">
          <div className="flex flex-col items-center gap-6 px-6 py-10 text-center md:px-12">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">You have signed out safely</h1>
              <p className="text-sm text-muted-foreground">
                Thanks for stopping by. You can close this tab or sign back in whenever you’re ready
                to continue.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <Button onClick={handleSignIn} className="inline-flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign in again
              </Button>
              <Button variant="secondary" asChild className="inline-flex items-center gap-2">
                <a href="/">
                  <Home className="h-4 w-4" />
                  Go to homepage
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
