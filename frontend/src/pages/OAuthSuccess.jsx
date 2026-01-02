/**
 * OAuth Success Page
 * Handles the redirect from Google OAuth callback
 * Extracts token from URL, saves to store, and redirects to dashboard
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';
import api from '../services/api';

function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthData } = useAuthStore();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    const processOAuth = async () => {
      // Get token from URL
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      // Handle errors from OAuth callback
      if (error) {
        setStatus('error');
        
        const errorMessages = {
          'google_not_configured': 'Google Sign-In is not configured. Please contact support.',
          'google_auth_failed': 'Google authentication failed. Please try again.',
          'token_generation_failed': 'Failed to complete sign in. Please try again.'
        };
        
        setMessage(errorMessages[error] || 'Authentication failed. Please try again.');
        toast.error(errorMessages[error] || 'Authentication failed');
        
        // Redirect to login after delay
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Check if token exists
      if (!token) {
        setStatus('error');
        setMessage('No authentication token received.');
        toast.error('Authentication failed - no token');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user profile to get user data
        const response = await api.get('/auth/profile');
        const user = response.data.user;

        // Save to auth store (same as normal login)
        setAuthData(user, token);
        
        setStatus('success');
        setMessage('Sign in successful! Redirecting...');
        toast.success(`Welcome, ${user.name || user.email}!`);

        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 1500);

      } catch (error) {
        console.error('OAuth token validation error:', error);
        setStatus('error');
        setMessage('Failed to validate authentication. Please try again.');
        toast.error('Authentication validation failed');
        
        // Clear any partial auth data
        delete api.defaults.headers.common['Authorization'];
        
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processOAuth();
  }, [searchParams, navigate, setAuthData]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="card p-8 max-w-md w-full mx-4 text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {status === 'processing' && (
            <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 mx-auto text-red-500" />
          )}
        </div>

        {/* Status Message */}
        <h1 className="text-2xl font-bold text-white mb-2">
          {status === 'processing' && 'Signing you in...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>
        
        <p className="text-dark-400">
          {message}
        </p>

        {/* Manual redirect link for error state */}
        {status === 'error' && (
          <button
            onClick={() => navigate('/login')}
            className="mt-6 btn-primary"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default OAuthSuccess;
