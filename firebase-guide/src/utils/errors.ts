import { FirebaseError } from 'firebase/app';
import { AppError } from '../types';

// Firebase Auth error codes mapping
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/requires-recent-login': 'Please log in again to complete this action.',
  'auth/invalid-credential': 'Invalid credentials provided.',
  'auth/credential-already-in-use': 'This credential is already associated with another account.',
  'auth/operation-not-allowed': 'This operation is not allowed.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
  'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
  'auth/cancelled-popup-request': 'Sign-in popup request was cancelled.',
};

// Firebase Storage error codes mapping
const STORAGE_ERROR_MESSAGES: Record<string, string> = {
  'storage/unknown': 'An unknown error occurred.',
  'storage/object-not-found': 'File not found.',
  'storage/bucket-not-found': 'Storage bucket not found.',
  'storage/project-not-found': 'Project not found.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  'storage/unauthenticated': 'User is not authenticated.',
  'storage/unauthorized': 'User is not authorized to perform this action.',
  'storage/retry-limit-exceeded': 'Maximum retry limit exceeded.',
  'storage/invalid-checksum': 'File checksum does not match.',
  'storage/canceled': 'Upload was cancelled.',
  'storage/invalid-event-name': 'Invalid event name.',
  'storage/invalid-url': 'Invalid URL provided.',
  'storage/invalid-argument': 'Invalid argument provided.',
  'storage/no-default-bucket': 'No default storage bucket configured.',
  'storage/cannot-slice-blob': 'Cannot slice blob.',
  'storage/server-file-wrong-size': 'Server file size mismatch.',
};

/**
 * Converts Firebase errors to user-friendly messages
 */
export function handleFirebaseError(error: FirebaseError): AppError {
  const errorCode = error.code;
  let message = error.message;

  // Check for auth errors
  if (AUTH_ERROR_MESSAGES[errorCode]) {
    message = AUTH_ERROR_MESSAGES[errorCode];
  }
  // Check for storage errors
  else if (STORAGE_ERROR_MESSAGES[errorCode]) {
    message = STORAGE_ERROR_MESSAGES[errorCode];
  }
  // Generic Firebase error
  else if (errorCode.startsWith('auth/') || errorCode.startsWith('storage/')) {
    message = 'An error occurred. Please try again.';
  }

  return {
    code: errorCode,
    message,
    details: error
  };
}

/**
 * Creates a generic app error
 */
export function createAppError(code: string, message: string, details?: any): AppError {
  return {
    code,
    message,
    details
  };
}

/**
 * Handles network errors with retry logic
 */
export class NetworkErrorHandler {
  private maxRetries: number;
  private baseDelay: number;

  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= this.maxRetries) {
        throw error;
      }

      // Check if error is retryable
      if (this.isRetryableError(error)) {
        const delay = this.calculateDelay(retryCount);
        await this.sleep(delay);
        return this.executeWithRetry(operation, retryCount + 1);
      }

      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    if (error instanceof FirebaseError) {
      const retryableCodes = [
        'auth/network-request-failed',
        'storage/retry-limit-exceeded',
        'unavailable',
        'deadline-exceeded'
      ];
      return retryableCodes.includes(error.code);
    }

    // Check for network errors
    if (error.name === 'NetworkError' || error.message?.includes('network')) {
      return true;
    }

    return false;
  }

  private calculateDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return exponentialDelay + jitter;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Error logger for debugging and monitoring
 */
export class ErrorLogger {
  static log(error: AppError, context?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', logData);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to your monitoring service (e.g., Sentry, LogRocket, etc.)
      this.sendToMonitoringService(logData);
    }
  }

  private static sendToMonitoringService(logData: any): void {
    // Implement your monitoring service integration here
    // Example: Sentry.captureException(logData);
  }
}

/**
 * Validation error handler
 */
export function createValidationError(field: string, message: string): AppError {
  return createAppError('validation/invalid-input', `${field}: ${message}`, { field });
}

/**
 * Global error boundary handler
 */
export function handleGlobalError(error: Error, errorInfo?: any): void {
  const appError = createAppError(
    'app/unhandled-error',
    'An unexpected error occurred',
    { error: error.message, stack: error.stack, errorInfo }
  );

  ErrorLogger.log(appError, 'Global Error Boundary');
}