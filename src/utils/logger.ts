/**
 * Secure logger utility that prevents sensitive information exposure in production
 * 
 * In development: Logs full error details for debugging
 * In production: Logs only generic messages to prevent information leakage
 */
export const logger = {
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      // Development: full error details for debugging
      console.error(message, error);
    } else {
      // Production: generic message only, no sensitive details
      console.error(message);
    }
  },
  
  warn: (message: string, details?: any) => {
    if (import.meta.env.DEV) {
      console.warn(message, details);
    } else {
      console.warn(message);
    }
  },
  
  info: (message: string, details?: any) => {
    if (import.meta.env.DEV) {
      console.info(message, details);
    } else {
      console.info(message);
    }
  }
};
