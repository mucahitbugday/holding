// Production'da console.error'ları devre dışı bırakır
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
};
