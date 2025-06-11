import React, { useState } from 'react';

export default function DataMigration() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const runMigration = async () => {
    setIsRunning(true);
    setStatus('running');
    
    try {
      // Simulate migration process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('success');
    } catch (error) {
      setStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'running':
        return 'Migration in progress...';
      case 'success':
        return 'Migration completed successfully!';
      case 'error':
        return 'Migration failed. Please try again.';
      default:
        return 'Ready to run migration';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Data Migration</h2>
      
      <div className="mb-4">
        <p className={`text-sm ${getStatusColor()}`}>
          {getStatusMessage()}
        </p>
      </div>

      <button
        onClick={runMigration}
        disabled={isRunning}
        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
          isRunning
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isRunning ? 'Running...' : 'Run Migration'}
      </button>
    </div>
  );
}