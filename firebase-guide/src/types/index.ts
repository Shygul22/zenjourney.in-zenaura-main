import { User } from 'firebase/auth';

// User types
export interface AppUser extends User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  displayName: string;
  confirmPassword: string;
}

export interface PasswordResetData {
  email: string;
}

// Storage types
export interface FileUploadData {
  file: File;
  path?: string;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  contentType?: string;
  customMetadata?: Record<string, string>;
  cacheControl?: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface StoredFile {
  name: string;
  fullPath: string;
  size: number;
  timeCreated: string;
  updated: string;
  downloadURL: string;
  contentType: string;
  metadata?: Record<string, any>;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// Component prop types
export interface AuthFormProps {
  onSuccess?: (user: AppUser) => void;
  onError?: (error: AppError) => void;
  loading?: boolean;
}

export interface FileUploadProps {
  onUploadComplete?: (file: StoredFile) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onError?: (error: AppError) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  uploadPath?: string;
}

// Configuration types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Utility types
export type AuthProvider = 'email' | 'google' | 'facebook' | 'twitter';

export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other';

export interface FileTypeConfig {
  extensions: string[];
  maxSize: number;
  mimeTypes: string[];
}