import { AlertTriangle, Phone } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileEmergencyCardProps {
  emergencyContact?: {
    name?: string;
    relation?: string;
    email?: string;
    phone?: string;
  };
  isLoading?: boolean;
}

export const ProfileEmergencyCard = ({
  emergencyContact,
  isLoading,
}: ProfileEmergencyCardProps): JSX.Element => {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Emergency contact</CardTitle>
        <CardDescription>Designated person for urgent communications.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-44 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-52 animate-pulse rounded bg-muted" />
          </div>
        ) : emergencyContact ? (
          <div className="space-y-2 text-sm">
            <div className="font-medium text-foreground">{emergencyContact.name ?? '—'}</div>
            <div className="text-muted-foreground">
              {emergencyContact.relation ? emergencyContact.relation : 'Relation not set'}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{emergencyContact.phone ?? 'Phone not provided'}</span>
            </div>
            <div className="text-xs text-muted-foreground">{emergencyContact.email ?? ''}</div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <p>No emergency contact has been added yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
