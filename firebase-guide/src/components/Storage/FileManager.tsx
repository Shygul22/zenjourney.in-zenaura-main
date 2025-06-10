import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { StoredFile } from '../../types';

export const FileManager: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUploadComplete = (file: StoredFile) => {
    setNotification({ type: 'success', message: `File "${file.name}" uploaded successfully!` });
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadError = (error: any) => {
    setNotification({ type: 'error', message: error.message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileDelete = (file: StoredFile) => {
    setNotification({ type: 'success', message: `File "${file.name}" deleted successfully!` });
    if (selectedFile?.fullPath === file.fullPath) {
      setSelectedFile(null);
    }
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileSelect = (file: StoredFile) => {
    setSelectedFile(file);
  };

  const closeFilePreview = () => {
    setSelectedFile(null);
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const isImage = selectedFile.contentType.startsWith('image/');
    const isPdf = selectedFile.contentType.includes('pdf');
    const isText = selectedFile.contentType.startsWith('text/');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">{selectedFile.name}</h3>
            <button
              onClick={closeFilePreview}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            {isImage && (
              <img
                src={selectedFile.downloadURL}
                alt={selectedFile.name}
                className="max-w-full max-h-96 object-contain mx-auto"
              />
            )}
            
            {isPdf && (
              <iframe
                src={selectedFile.downloadURL}
                className="w-full h-96"
                title={selectedFile.name}
              />
            )}
            
            {isText && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Text file preview not available</p>
                <a
                  href={selectedFile.downloadURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in new tab
                </a>
              </div>
            )}
            
            {!isImage && !isPdf && !isText && (
              <div className="text-center">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                <a
                  href={selectedFile.downloadURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
              </div>
            )}
          </div>
          
          <div className="px-4 pb-4 text-sm text-gray-500">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <div>
                <strong>Type:</strong> {selectedFile.contentType}
              </div>
              <div>
                <strong>Uploaded:</strong> {new Date(selectedFile.timeCreated).toLocaleDateString()}
              </div>
              <div>
                <strong>Modified:</strong> {new Date(selectedFile.updated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File Manager</h1>
        <p className="text-gray-600">Upload, manage, and organize your files securely</p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-md ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400\" viewBox="0 0 20 20\" fill="currentColor">
                  <path fillRule="evenodd\" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z\" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setNotification(null)}
                className="inline-flex text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Files</h2>
        <FileUpload
          onUploadComplete={handleUploadComplete}
          onError={handleUploadError}
          maxFileSize={50 * 1024 * 1024} // 50MB
          acceptedFileTypes={[
            'image/*',
            'application/pdf',
            'text/*',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]}
        />
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FileList
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* File Preview Modal */}
      {renderFilePreview()}
    </div>
  );
};