import { Loader2 } from 'lucide-react';

interface FullScreenLoaderProps {
  message?: string;
}

export const FullScreenLoader = ({
  message = 'Loading...',
}: FullScreenLoaderProps): JSX.Element => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
