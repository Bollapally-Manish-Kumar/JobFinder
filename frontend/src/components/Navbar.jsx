/**
 * Navbar Component - Public navbar for landing page
 */

import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../hooks/useAuthStore';

function Navbar() {
  const { user, token, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Only show Dashboard if both token AND user exist (valid session)
  const isLoggedIn = token && user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">J+</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-white">JobFinder+</span>
          </Link>

          {/* Navigation links - Desktop */}
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

          {/* Auth buttons - Desktop */}
          <div className="hidden sm:flex items-center gap-3">
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
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-dark-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-4 border-t border-dark-800">
            <div className="flex flex-col gap-4">
              <a 
                href="#home" 
                className="text-dark-300 hover:text-white transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a 
                href="#how-it-works" 
                className="text-dark-300 hover:text-white transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </a>
              <a 
                href="#pricing" 
                className="text-dark-300 hover:text-white transition-colors px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-dark-700">
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    className="btn-primary text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn-secondary text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
