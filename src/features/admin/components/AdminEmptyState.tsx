import type { ReactNode } from 'react';

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const AdminEmptyState = ({
  title,
  description,
  actions,
}: AdminEmptyStateProps): JSX.Element => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-background/70 px-6 py-14 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? <p className="max-w-xl text-sm text-muted-foreground">{description}</p> : null}
      {actions}
    </div>
  );
};
