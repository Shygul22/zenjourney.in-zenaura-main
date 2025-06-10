import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { PasswordResetData } from '../../types';
import { validateEmail } from '../../utils/validation';

interface PasswordResetProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onBack?: () => void;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({ onSuccess, onError, onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.resetPassword({ email });
      setEmailSent(true);
      onSuccess?.();
    } catch (error: any) {
      onError?.(error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      await authService.resetPassword({ email });
      setErrors({ general: '' });
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
              <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or
            </p>
            
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="text-blue-600 hover:text-blue-500 font-medium text-sm disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend email'}
            </button>
          </div>
          
          <div className="mt-6">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-500 font-medium text-sm"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
            disabled={loading}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns="http://www.w3.org/2000/svg\" fill="none\" viewBox="0 0 24 24">
                <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Reset Link...
            </div>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-500 font-medium text-sm"
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  );
};