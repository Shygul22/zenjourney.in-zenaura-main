import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  UploadTask
} from 'firebase/storage';
import { storage, auth } from '../config/firebase';
import { FileUploadData, UploadProgress, StoredFile, AppError, FileMetadata } from '../types';
import { handleFirebaseError, NetworkErrorHandler, ErrorLogger } from '../utils/errors';
import { validateFile, sanitizeFileName } from '../utils/validation';

const networkHandler = new NetworkErrorHandler();

/**
 * Storage service class
 */
export class StorageService {
  private static instance: StorageService;
  private activeUploads: Map<string, UploadTask> = new Map();

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Upload a file to Firebase Storage
   */
  async uploadFile(
    uploadData: FileUploadData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<StoredFile> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to upload files');
      }

      // Validate file
      const fileError = validateFile(uploadData.file, {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });

      if (fileError) {
        throw new Error(fileError.message);
      }

      // Generate file path
      const fileName = sanitizeFileName(uploadData.file.name);
      const filePath = uploadData.path || `users/${user.uid}/files/${Date.now()}_${fileName}`;
      const storageRef = ref(storage, filePath);

      // Prepare metadata
      const metadata: FileMetadata = {
        contentType: uploadData.file.type,
        customMetadata: {
          uploadedBy: user.uid,
          uploadedAt: new Date().toISOString(),
          originalName: uploadData.file.name,
          ...uploadData.metadata?.customMetadata
        },
        ...uploadData.metadata
      };

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, uploadData.file, metadata);
      const uploadId = `${Date.now()}_${Math.random()}`;
      this.activeUploads.set(uploadId, uploadTask);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            if (onProgress) {
              const progress: UploadProgress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              };
              onProgress(progress);
            }
          },
          (error) => {
            // Error callback
            this.activeUploads.delete(uploadId);
            const appError = handleFirebaseError(error);
            ErrorLogger.log(appError, 'StorageService.uploadFile');
            reject(appError);
          },
          async () => {
            // Success callback
            try {
              this.activeUploads.delete(uploadId);
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const fileMetadata = await getMetadata(uploadTask.snapshot.ref);
              
              const storedFile: StoredFile = {
                name: fileName,
                fullPath: filePath,
                size: fileMetadata.size,
                timeCreated: fileMetadata.timeCreated,
                updated: fileMetadata.updated,
                downloadURL,
                contentType: fileMetadata.contentType || 'application/octet-stream',
                metadata: fileMetadata.customMetadata
              };

              ErrorLogger.log({
                code: 'storage/upload-success',
                message: 'File uploaded successfully'
              }, 'StorageService.uploadFile');

              resolve(storedFile);
            } catch (error: any) {
              const appError = handleFirebaseError(error);
              ErrorLogger.log(appError, 'StorageService.uploadFile');
              reject(appError);
            }
          }
        );
      });
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'StorageService.uploadFile');
      throw appError;
    }
  }

  /**
   * Cancel an active upload
   */
  cancelUpload(uploadId: string): boolean {
    const uploadTask = this.activeUploads.get(uploadId);
    if (uploadTask) {
      uploadTask.cancel();
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }

  /**
   * Download a file (get download URL)
   */
  async getFileDownloadURL(filePath: string): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to access files');
      }

      const storageRef = ref(storage, filePath);
      const downloadURL = await networkHandler.executeWithRetry(() =>
        getDownloadURL(storageRef)
      );

      return downloadURL;
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'StorageService.getFileDownloadURL');
      throw appError;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to delete files');
      }

      // Check if user owns the file (basic security check)
      if (!filePath.includes(`users/${user.uid}/`)) {
        throw new Error('Unauthorized: Cannot delete files that do not belong to you');
      }

      const storageRef = ref(storage, filePath);
      await networkHandler.executeWithRetry(() => deleteObject(storageRef));

      ErrorLogger.log({
        code: 'storage/delete-success',
        message: 'File deleted successfully'
      }, 'StorageService.deleteFile');
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'StorageService.deleteFile');
      throw appError;
    }
  }

  /**
   * List user files
   */
  async listUserFiles(folderPath?: string): Promise<StoredFile[]> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to list files');
      }

      const basePath = folderPath || `users/${user.uid}/files`;
      const storageRef = ref(storage, basePath);
      
      const listResult = await networkHandler.executeWithRetry(() => listAll(storageRef));
      
      const files: StoredFile[] = [];
      
      for (const itemRef of listResult.items) {
        try {
          const [downloadURL, metadata] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef)
          ]);

          const file: StoredFile = {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            size: metadata.size,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
            downloadURL,
            contentType: metadata.contentType || 'application/octet-stream',
            metadata: metadata.customMetadata
          };

          files.push(file);
        } catch (error) {
          // Skip files that can't be accessed
          console.warn(`Could not access file ${itemRef.fullPath}:`, error);
        }
      }

      // Sort by upload date (newest first)
      files.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());

      return files;
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'StorageService.listUserFiles');
      throw appError;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<any> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to access file metadata');
      }

      const storageRef = ref(storage, filePath);
      const metadata = await networkHandler.executeWithRetry(() => getMetadata(storageRef));

      return metadata;
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'StorageService.getFileMetadata');
      throw appError;
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(filePath: string, newMetadata: FileMetadata): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to update file metadata');
      }

      // Check if user owns the file
      if (!filePath.includes(`users/${user.uid}/`)) {
        throw new Error('Unauthorized: Cannot update metadata for files that do not belong to you');
      }

      const storageRef = ref(storage, filePath);
      await networkHandler.executeWithRetry(() => updateMetadata(storageRef, newMetadata));

      ErrorLogger.log({
        code: 'storage/metadata-updated',
        message: 'File metadata updated successfully'
      }, 'StorageService.updateFileMetadata');
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'StorageService.updateFileMetadata');
      throw appError;
    }
  }

  /**
   * Get storage usage for user
   */
  async getUserStorageUsage(): Promise<{ totalSize: number; fileCount: number }> {
    try {
      const files = await this.listUserFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      return {
        totalSize,
        fileCount: files.length
      };
    } catch (error: any) {
      const appError = handleFirebaseError(error);
      ErrorLogger.log(appError, 'StorageService.getUserStorageUsage');
      throw appError;
    }
  }

  /**
   * Generate a unique file path for user
   */
  generateUserFilePath(fileName: string, folder = 'files'): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const sanitizedFileName = sanitizeFileName(fileName);
    const timestamp = Date.now();
    return `users/${user.uid}/${folder}/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const storageRef = ref(storage, filePath);
      await getMetadata(storageRef);
      return true;
    } catch (error: any) {
      if (error.code === 'storage/object-not-found') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Batch delete files
   */
  async deleteMultipleFiles(filePaths: string[]): Promise<{ success: string[]; failed: string[] }> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to delete files');
    }

    const results = { success: [], failed: [] };

    for (const filePath of filePaths) {
      try {
        await this.deleteFile(filePath);
        results.success.push(filePath);
      } catch (error) {
        results.failed.push(filePath);
        ErrorLogger.log(
          handleFirebaseError(error as any),
          `StorageService.deleteMultipleFiles - ${filePath}`
        );
      }
    }

    return results;
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();