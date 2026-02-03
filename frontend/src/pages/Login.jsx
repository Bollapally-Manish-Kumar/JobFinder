/**
 * Login Page - User authentication
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';

// Backend URL for OAuth (production Render URL)
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://jobfinder-wog8.onrender.com';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Handle OAuth error messages from URL
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const errorMessages = {
        'google_not_configured': 'Google Sign-In is not available. Please use email login.',
        'google_auth_failed': 'Google authentication failed. Please try again.',
        'token_generation_failed': 'Failed to complete sign in. Please try again.'
      };
      toast.error(errorMessages[oauthError] || 'Authentication failed');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[Login] Form submitted');
    clearError();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    console.log('[Login] Calling login function');
    const result = await login(email, password);
    console.log('[Login] Login result:', result);
    
    if (result.success) {
      console.log('[Login] Success! Navigating to:', from);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      console.log('[Login] Failed:', result.error);
      // Check if user should use Google login
      if (result.error?.includes('Google')) {
        toast.error(result.error);
      } else {
        toast.error(result.error);
      }
    }
  };

  // Handle Google Sign-In
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <SEO 
        title="Login - Access Your Job Dashboard | GoAxon AI"
        description="Login to GoAxon AI to access personalized job recommendations, AI resume builder, and application tracking. Secure authentication with Google OAuth."
        keywords="login, sign in, job portal login, user authentication"
        url="https://www.goaxonai.in/login"
      />
      {/* Background effects */}
      <div className="absolute inset-0 stars-bg opacity-30" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold">J+</span>
          </div>
          <span className="text-2xl font-bold text-white">GoAxon AI</span>
        </Link>

        {/* Login card */}
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Login to Your Account
          </h1>
          <p className="text-dark-400 text-center mb-8">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-dark-300">
                  Password
                </label>
                <a href="#" className="text-sm text-primary-500 hover:text-primary-400">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-800 text-dark-400">Or</span>
            </div>
          </div>

          {/* Social login - Google only */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full btn-secondary flex items-center justify-center gap-3 py-3 hover:bg-dark-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-dark-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
