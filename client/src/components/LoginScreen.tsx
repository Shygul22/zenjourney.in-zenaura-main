import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, CheckSquare, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen = () => {
  const { signInWithGoogle, loading, error } = useAuth();

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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
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