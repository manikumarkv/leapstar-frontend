import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export const Toaster = (): JSX.Element => {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, className, ...toastProps }) => (
        <Toast
          key={id}
          {...toastProps}
          className={cn(
            className,
            variant === 'success' &&
              'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-50',
            variant === 'destructive' && 'border-destructive/50 bg-destructive/10 text-destructive',
          )}
        >
          <div className="grid gap-1">
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
};
