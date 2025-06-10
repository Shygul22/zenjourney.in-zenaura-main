import React, { useState, useRef } from 'react';
import { storageService } from '../../services/storage';
import { FileUploadProps, UploadProgress } from '../../types';
import { validateFile } from '../../utils/validation';

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadProgress,
  onError,
  acceptedFileTypes = ['image/*', 'application/pdf', 'text/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  uploadPath
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    // Validate file
    const fileError = validateFile(file, {
      maxSize: maxFileSize,
      allowedTypes: acceptedFileTypes
    });

    if (fileError) {
      onError?.({
        code: 'validation/invalid-file',
        message: fileError.message
      });
      return;
    }

    setUploading(true);
    setProgress({ bytesTransferred: 0, totalBytes: file.size, percentage: 0 });

    try {
      const uploadData = {
        file,
        path: uploadPath || storageService.generateUserFilePath(file.name),
        metadata: {
          customMetadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        }
      };

      const storedFile = await storageService.uploadFile(uploadData, (progressData) => {
        setProgress(progressData);
        onUploadProgress?.(progressData);
      });

      onUploadComplete?.(storedFile);
    } catch (error: any) {
      onError?.(error);
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        onChange={(e) => handleFileSelect(e.target.files)}
        accept={acceptedFileTypes.join(',')}
        className="hidden"
        disabled={uploading}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900">Uploading...</p>
              {progress && (
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(progress.bytesTransferred)} of {formatFileSize(progress.totalBytes)} ({Math.round(progress.percentage)}%)
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Maximum file size: {formatFileSize(maxFileSize)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: {acceptedFileTypes.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};