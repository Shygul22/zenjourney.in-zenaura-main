import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ExternalLink } from 'lucide-react';

export const AuthMessage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">Firebase Setup Required</CardTitle>
            <p className="text-gray-600 mt-2">Domain authorization needed</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">Next Steps:</h3>
            <ol className="text-sm text-orange-700 space-y-2 list-decimal list-inside">
              <li>Go to your Firebase Console</li>
              <li>Navigate to Authentication → Settings</li>
              <li>Add this domain to "Authorized domains":</li>
            </ol>
            <div className="mt-3 p-2 bg-white rounded border font-mono text-sm break-all">
              {window.location.hostname}
            </div>
          </div>
          
          <div className="text-center">
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Firebase Console</span>
            </a>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            After adding the domain, refresh this page to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};