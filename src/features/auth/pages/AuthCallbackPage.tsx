import { Loader2 } from 'lucide-react';

export const AuthCallbackPage = (): JSX.Element => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Signing you in</h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Please wait while we finish connecting to your account.
          </p>
        </div>
      </div>
    </div>
  );
};
