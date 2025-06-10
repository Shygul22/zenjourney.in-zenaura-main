import React, { useState, useEffect } from 'react';
import { UserDashboard } from './pages/UserDashboard';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { PasswordReset } from './components/Auth/PasswordReset';
import { GoogleSignIn } from './components/Auth/GoogleSignIn';
import { authService } from './services/auth';
import { AppUser } from './types';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

type AuthMode = 'login' | 'signup' | 'reset' | 'dashboard';

function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setAuthMode(user ? 'dashboard' : 'login');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleAuthSuccess = (user: AppUser) => {
    setUser(user);
    setAuthMode('dashboard');
    setError(null);
  };

  const handleAuthError = (error: any) => {
    setError(error.message);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-lg font-medium text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (authMode === 'dashboard' && user) {
    return <UserDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firebase Demo App
          </h1>
          <p className="text-gray-600">
            Complete Authentication & Storage Implementation
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            {authMode === 'login' && (
              <div className="space-y-4">
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <GoogleSignIn
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                />

                <div className="text-center space-y-2">
                  <Button
                    variant="link"
                    onClick={() => setAuthMode('signup')}
                    className="text-sm"
                  >
                    Don't have an account? Sign up
                  </Button>
                  <br />
                  <Button
                    variant="link"
                    onClick={() => setAuthMode('reset')}
                    className="text-sm"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="space-y-4">
                <SignupForm
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <GoogleSignIn
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                />

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setAuthMode('login')}
                    className="text-sm"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </div>
            )}

            {authMode === 'reset' && (
              <PasswordReset
                onSuccess={() => setAuthMode('login')}
                onError={handleAuthError}
                onBack={() => setAuthMode('login')}
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This is a demonstration of Firebase Authentication and Storage
            implementation with production-ready security features.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;