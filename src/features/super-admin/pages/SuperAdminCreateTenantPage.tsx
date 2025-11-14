import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { CreateTenantForm } from '../components/CreateTenantForm';
import { SuperAdminLayout } from '../components/SuperAdminLayout';

export const SuperAdminCreateTenantPage = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <SuperAdminLayout
      title="Create tenant"
      description="Launch a new district or organization. Configure branding, domains, and roles after creation."
      breadcrumbs={[
        { label: 'Super admin portal', href: '/super-admin' },
        { label: 'Tenants', href: '/super-admin/tenants' },
        { label: 'Create tenant' },
      ]}
      documentTitle="Super Admin • Create tenant"
    >
      <Card className="max-w-3xl border-border/80">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Tenant details</CardTitle>
          <CardDescription>
            Provide the core information for the new tenant. You can adjust advanced settings later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTenantForm
            onSuccess={() => {
              navigate('/super-admin/tenants');
            }}
          />
        </CardContent>
      </Card>
    </SuperAdminLayout>
  );
};
