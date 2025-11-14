import * as React from 'react';

import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1_000;

type ToastVariant = 'default' | 'success' | 'destructive';

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
};

export type Toast = Omit<ToasterToast, 'id'>;

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: 'REMOVE_TOAST', toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

type State = {
  toasts: ToasterToast[];
};

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> & { id: string } }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST': {
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    }

    case 'UPDATE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === action.toast.id ? { ...toast, ...action.toast } : toast,
        ),
      };
    }

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        for (const toast of state.toasts) {
          addToRemoveQueue(toast.id);
        }
      }

      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === toastId || toastId === undefined ? { ...toast, open: false } : toast,
        ),
      };
    }

    case 'REMOVE_TOAST': {
      if (action.toastId === undefined) {
        return { ...state, toasts: [] };
      }

      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId),
      };
    }

    default:
      return state;
  }
};

const listeners = new Set<(state: State) => void>();

let memoryState: State = { toasts: [] };

const dispatch = (action: Action) => {
  memoryState = reducer(memoryState, action);
  for (const listener of listeners) {
    listener(memoryState);
  }
};

type ToastReturn = {
  id: string;
  dismiss: () => void;
  update: (props: Partial<Toast>) => void;
};

type ToastArgs = Toast | string;

const resolveToast = (args: ToastArgs, overrides?: Partial<Toast>): Toast => {
  const extra = overrides ?? {};

  if (typeof args === 'string') {
    return {
      ...extra,
      title: args,
    };
  }

  return {
    ...args,
    ...extra,
  };
};

const createToast = (toast: Toast): ToastReturn => {
  const id = `toast-${Math.random().toString(36).slice(2)}`;
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...toast,
      id,
      open: true,
      onOpenChange: (open) => {
        toast.onOpenChange?.(open);
        if (!open) {
          dismiss();
        }
      },
    },
  });

  return {
    id,
    dismiss,
    update: (props: Partial<Toast>) => dispatch({ type: 'UPDATE_TOAST', toast: { ...props, id } }),
  };
};

type ToastFunction = {
  (toast: Toast): ToastReturn;
  dismiss: (toastId?: string) => void;
  success: (message: ToastArgs, options?: Partial<Toast>) => ToastReturn;
  error: (message: ToastArgs, options?: Partial<Toast>) => ToastReturn;
};

export const toast: ToastFunction = Object.assign((toast: Toast) => createToast(toast), {
  dismiss(toastId?: string) {
    dispatch({ type: 'DISMISS_TOAST', toastId });
  },
  success(message: ToastArgs, options?: Partial<Toast>) {
    const next = resolveToast(message, { ...options, variant: 'success' });
    return createToast(next);
  },
  error(message: ToastArgs, options?: Partial<Toast>) {
    const next = resolveToast(message, { ...options, variant: 'destructive' });
    return createToast(next);
  },
});

export const useToast = () => {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: toast.dismiss,
  };
};
