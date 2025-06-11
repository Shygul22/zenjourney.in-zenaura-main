import React from 'react';

interface AuthMessageProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export default function AuthMessage({ message, type = 'info' }: AuthMessageProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getTypeStyles()}`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}