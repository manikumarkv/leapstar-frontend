import { Mail, Phone } from 'lucide-react';

import type { CurrentUserResponse } from '@/api/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileContactCardProps {
  user: CurrentUserResponse['user'] | undefined;
  isLoading?: boolean;
}

export const ProfileContactCard = ({ user, isLoading }: ProfileContactCardProps): JSX.Element => {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Account identity</CardTitle>
        <CardDescription>Primary authentication identity & basic profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="font-medium text-foreground">{user?.name ?? 'Unnamed user'}</div>
            <div className="flex items-center gap-2 break-all text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user?.email ?? 'Email not set'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{user?.name ? '—' : '—'}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
