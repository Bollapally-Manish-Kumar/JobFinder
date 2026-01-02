/**
 * Navbar Component - Public navbar for landing page
 */

import { Link } from 'react-router-dom';
import useAuthStore from '../hooks/useAuthStore';

function Navbar() {
  const { user, token, logout } = useAuthStore();
  
  // Only show Dashboard if both token AND user exist (valid session)
  const isLoggedIn = token && user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">J+</span>
            </div>
            <span className="text-xl font-bold text-white">JobFinder+</span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-dark-300 hover:text-white transition-colors">
              Home
            </a>
            <a href="#how-it-works" className="text-dark-300 hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-dark-300 hover:text-white transition-colors">
              Pricing
            </a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="btn-primary"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-secondary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary hidden sm:block"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
