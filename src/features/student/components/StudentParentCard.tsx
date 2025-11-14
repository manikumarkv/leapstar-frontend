import { Mail, Phone, UserRound } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StudentParentCardProps {
  name: string;
  relationship: string;
  email?: string | null;
  phone?: string | null;
  className?: string;
}

export const StudentParentCard = ({
  name,
  relationship,
  email,
  phone,
  className,
}: StudentParentCardProps): JSX.Element => {
  const emailDisplay = email && email.trim().length ? email : '—';
  const phoneDisplay = phone && phone.trim().length ? phone : '—';

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-6 rounded-3xl border border-border/50 bg-white/95 p-6 shadow-xl transition-all dark:border-white/5 dark:bg-slate-950/80',
        'backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-950/70',
        'hover:-translate-y-1 hover:shadow-2xl',
        className,
      )}
    >
      <div className="flex items-start gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20">
          <UserRound className="h-7 w-7" aria-hidden />
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {name}
          </h3>
          <p className="text-sm font-medium text-muted-foreground dark:text-slate-300">
            {relationship}
          </p>
        </div>
      </div>

      <dl className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
        <div className="flex items-start gap-3">
          <Mail className="mt-1 h-4 w-4 text-primary" aria-hidden />
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground dark:text-slate-400">
              Email
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-white">{emailDisplay}</dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="mt-1 h-4 w-4 text-primary" aria-hidden />
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground dark:text-slate-400">
              Phone
            </dt>
            <dd className="font-semibold text-slate-900 dark:text-white">{phoneDisplay}</dd>
          </div>
        </div>
      </dl>

      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-transparent transition group-hover:ring-primary/40" />
    </article>
  );
};

export const StudentParentCardSkeleton = (): JSX.Element => {
  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-border/50 bg-white/80 p-6 shadow-xl dark:border-white/5 dark:bg-slate-950/60">
      <div className="flex items-start gap-5">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="mt-1 h-4 w-4" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Skeleton className="mt-1 h-4 w-4" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </div>
      </div>
    </article>
  );
};
