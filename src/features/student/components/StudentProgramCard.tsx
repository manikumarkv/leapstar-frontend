import { CalendarDays, Clock, Coins, MapPin, Users } from 'lucide-react';
import type { FC } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type StatusTone = 'primary' | 'success' | 'warning' | 'neutral';

const pillToneClasses: Record<StatusTone, string> = {
  primary:
    'border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/20 dark:text-primary-foreground',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300',
  warning:
    'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-200',
  neutral:
    'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-400/40 dark:bg-slate-500/20 dark:text-slate-200',
};

export interface StudentProgramCardData {
  id: string;
  title: string;
  summary: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  enrollmentLabel: string;
  pointsLabel: string;
  actionLabel: string;
  actionDisabled?: boolean;
  statusPill?: {
    label: string;
    tone?: StatusTone;
  } | null;
}

interface StudentProgramCardProps {
  program: StudentProgramCardData;
  onAction?: (programId: string) => void;
}

export const StudentProgramCard: FC<StudentProgramCardProps> = ({ program, onAction }) => {
  const tone = program.statusPill?.tone ?? 'primary';

  return (
    <article className="flex h-full flex-col gap-6 rounded-3xl border border-border/70 bg-card p-7 text-foreground shadow-lg transition-colors dark:border-border/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/80 dark:text-white">
      <header className="space-y-3">
        <h3 className="text-xl font-semibold leading-tight">{program.title}</h3>
        <p className="text-sm text-muted-foreground dark:text-slate-300">{program.summary}</p>
      </header>

      <dl className="space-y-3 text-sm text-muted-foreground dark:text-slate-200">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground dark:text-slate-300" />
          <span>{program.dateLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground dark:text-slate-300" />
          <span>{program.timeLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground dark:text-slate-300" />
          <span>{program.locationLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-4 w-4 text-muted-foreground dark:text-slate-300" />
          <span>{program.enrollmentLabel}</span>
        </div>
      </dl>

      <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1 text-sm font-semibold text-foreground dark:bg-slate-800/80 dark:text-white">
            <Coins className="h-4 w-4 text-muted-foreground dark:text-slate-200" />
            {program.pointsLabel}
          </span>
          {program.statusPill ? (
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
                pillToneClasses[tone],
              )}
            >
              {program.statusPill.label}
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          className="h-11 w-full rounded-full text-sm font-semibold sm:w-40"
          disabled={program.actionDisabled}
          onClick={() => {
            onAction?.(program.id);
          }}
        >
          {program.actionLabel}
        </Button>
      </div>
    </article>
  );
};

export const StudentProgramCardSkeleton: FC = () => {
  return (
    <article className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card p-7 text-foreground shadow-lg dark:border-border/50 dark:bg-slate-900/70 dark:text-white">
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <Skeleton className="h-11 w-full rounded-full sm:w-40" />
      </div>
    </article>
  );
};
