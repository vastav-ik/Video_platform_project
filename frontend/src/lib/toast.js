import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message, options) => {
    return sonnerToast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  error: (message, options) => {
    return sonnerToast.error(message, {
      duration: 4000,
      ...options,
    });
  },

  info: (message, options) => {
    return sonnerToast.info(message, {
      duration: 3000,
      ...options,
    });
  },

  loading: (message, options) => {
    return sonnerToast.loading(message, options);
  },

  promise: (promise, messages) => {
    return sonnerToast.promise(promise, messages);
  },
};
