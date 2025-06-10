import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, CheckSquare, Calendar, Settings, AlertCircle, ExternalLink, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen = () => {
  const { signInWithGoogle, signInDemo, loading, error } = useAuth();
  
  const isUnauthorizedDomain = error && error.includes('auth/unauthorized-domain');
  const isOperationNotAllowed = error && error.includes('auth/operation-not-allowed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gradient">ZenJourney</CardTitle>
            <p className="text-gray-600 mt-2">Your intelligent task management companion</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Smart Tasks</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Time Blocking</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Custom Settings</p>
            </div>
          </div>

          {error && (
            <div className={`p-3 border rounded-lg ${
              isUnauthorizedDomain || isOperationNotAllowed
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {isUnauthorizedDomain ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">Domain Authorization Required</p>
                  </div>
                  <div className="text-sm text-orange-700 space-y-2">
                    <p>Add this domain to your Firebase project:</p>
                    <div className="p-2 bg-white rounded border font-mono text-xs break-all">
                      {window.location.hostname}
                    </div>
                    <p>Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Go to Firebase Console → Authentication → Settings</li>
                      <li>Add the domain above to "Authorized domains"</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Firebase Console</span>
                  </a>
                </div>
              ) : isOperationNotAllowed ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">Google Sign-in Not Enabled</p>
                  </div>
                  <div className="text-sm text-orange-700 space-y-2">
                    <p>Enable Google authentication in your Firebase project:</p>
                    <p>Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Go to Firebase Console → Authentication → Sign-in method</li>
                      <li>Click on "Google" provider</li>
                      <li>Toggle "Enable" and configure OAuth settings</li>
                      <li>Save the changes and refresh this page</li>
                    </ol>
                  </div>
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-orange-600 hover:text-orange-700 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Firebase Console</span>
                  </a>
                </div>
              ) : (
                <p className="text-sm text-red-700">{error}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full interactive-primary h-12 text-base"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="w-5 h-5" />
                  <span>Sign in with Google</span>
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              onClick={signInDemo}
              disabled={loading}
              variant="outline"
              className="w-full h-12 text-base border-2 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Try Demo Mode</span>
              </div>
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
              Your data is securely stored and synchronized across devices.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};