import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { StoredFile } from '../../types';

interface FileListProps {
  onFileSelect?: (file: StoredFile) => void;
  onFileDelete?: (file: StoredFile) => void;
  refreshTrigger?: number;
}

export const FileList: React.FC<FileListProps> = ({ onFileSelect, onFileDelete, refreshTrigger }) => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const userFiles = await storageService.listUserFiles();
      setFiles(userFiles);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: StoredFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(file.fullPath));
    
    try {
      await storageService.deleteFile(file.fullPath);
      setFiles(prev => prev.filter(f => f.fullPath !== file.fullPath));
      onFileDelete?.(file);
    } catch (error: any) {
      alert(`Failed to delete file: ${error.message}`);
    } finally {
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.fullPath);
        return newSet;
      });
    }
  };

  const handleDownload = async (file: StoredFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.downloadURL;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      alert(`Failed to download file: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (contentType: string): string => {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.includes('pdf')) return '📄';
    if (contentType.startsWith('text/')) return '📝';
    if (contentType.startsWith('video/')) return '🎥';
    if (contentType.startsWith('audio/')) return '🎵';
    return '📁';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-blue-600\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
          <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Error loading files: {error}</div>
        <button
          onClick={loadFiles}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">📁</div>
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Your Files ({files.length})</h3>
        <button
          onClick={loadFiles}
          className="text-blue-600 hover:text-blue-500 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {files.map((file) => (
          <div
            key={file.fullPath}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(file.contentType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.timeCreated)}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {file.contentType.split('/')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onFileSelect?.(file)}
                  className="p-2 text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded"
                  title="View file"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 text-green-600 hover:text-green-500 hover:bg-green-50 rounded"
                  title="Download file"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleDelete(file)}
                  disabled={deletingFiles.has(file.fullPath)}
                  className="p-2 text-red-600 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                  title="Delete file"
                >
                  {deletingFiles.has(file.fullPath) ? (
                    <svg className="animate-spin h-4 w-4\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                      <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};