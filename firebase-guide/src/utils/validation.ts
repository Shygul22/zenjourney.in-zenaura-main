import { ValidationError } from '../types';

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }

  return null;
}

/**
 * Password validation with strength requirements
 */
export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }

  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { field: 'password', message: 'Password must be less than 128 characters' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one number' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one special character' };
  }

  return null;
}

/**
 * Confirm password validation
 */
export function validateConfirmPassword(password: string, confirmPassword: string): ValidationError | null {
  if (!confirmPassword) {
    return { field: 'confirmPassword', message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }

  return null;
}

/**
 * Display name validation
 */
export function validateDisplayName(displayName: string): ValidationError | null {
  if (!displayName) {
    return { field: 'displayName', message: 'Display name is required' };
  }

  if (displayName.length < 2) {
    return { field: 'displayName', message: 'Display name must be at least 2 characters long' };
  }

  if (displayName.length > 50) {
    return { field: 'displayName', message: 'Display name must be less than 50 characters' };
  }

  // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(displayName)) {
    return { field: 'displayName', message: 'Display name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }

  return null;
}

/**
 * File validation
 */
export function validateFile(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): ValidationError | null {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options;

  if (!file) {
    return { field: 'file', message: 'Please select a file' };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { field: 'file', message: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { field: 'file', message: `File type ${file.type} is not allowed` };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return { field: 'file', message: `File extension .${fileExtension} is not allowed` };
    }
  }

  return null;
}

/**
 * Batch validation function
 */
export function validateForm(data: Record<string, any>, validators: Record<string, (value: any) => ValidationError | null>): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, validator] of Object.entries(validators)) {
    const error = validator(data[field]);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Password strength calculator
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;
  else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeating characters');
  }

  if (/123|abc|qwe/i.test(password)) {
    score -= 1;
    feedback.push('Avoid common sequences');
  }

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 3) strength = 'fair';
  else if (score <= 4) strength = 'good';
  else strength = 'strong';

  return { score: Math.max(0, score), feedback, strength };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * File name sanitization
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}