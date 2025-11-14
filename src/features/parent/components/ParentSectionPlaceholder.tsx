import type { ReactNode } from 'react';

interface ParentSectionPlaceholderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const ParentSectionPlaceholder = ({
  title,
  description,
  action,
}: ParentSectionPlaceholderProps): JSX.Element => {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/70 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};
