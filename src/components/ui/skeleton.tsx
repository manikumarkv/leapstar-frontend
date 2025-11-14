import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = ({ className, ...props }: SkeletonProps): JSX.Element => {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
};
