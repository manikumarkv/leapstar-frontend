import { useNavigate } from 'react-router-dom';

import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';

export const UnauthorizedPage = (): JSX.Element => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-16">
        <div className="modern-card w-full max-w-xl text-center shadow-2xl">
          <div className="flex flex-col items-center gap-6 px-8 py-10">
            <h1 className="text-3xl font-semibold">Access restricted</h1>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have permission to view this dashboard. If you believe this is a
              mistake, contact your program administrator.
            </p>
            <Button onClick={handleGoHome}>Go back home</Button>
          </div>
        </div>
      </main>
    </div>
  );
};
