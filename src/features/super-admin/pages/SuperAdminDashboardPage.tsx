import { Shield, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { SuperAdminLayout } from '../components/SuperAdminLayout';

export const SuperAdminDashboardPage = (): JSX.Element => {
  return (
    <SuperAdminLayout
      title="Platform overview"
      description="Monitor tenants, system health, and platform-wide roles."
      breadcrumbs={[{ label: 'Super admin portal', href: '/super-admin' }]}
      documentTitle="Super Admin • Platform overview"
    >
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Active tenants</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-foreground">—</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Track tenant growth and onboarding activity here.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Platform roles</CardTitle>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight text-foreground">—</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Review global permissions and audit changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};
