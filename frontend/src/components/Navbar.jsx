/**
 * Navbar Component - Modern floating navbar with glassmorphism
 */

import { Link } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../hooks/useAuthStore';

function Navbar() {
  const { user, token } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = token && user;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl transition-all duration-500 ${scrolled ? 'top-2' : 'top-4'
      }`}>
      {/* Thin glowing orange border wrapper */}
      <div className="relative">
        <div className="absolute -inset-[0.5px] bg-orange-400/40 rounded-full" />

        {/* Main navbar - Glassmorphism */}
        <div className={`relative bg-dark-900/60 backdrop-blur-xl rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-300 ${scrolled ? 'bg-dark-900/80' : ''
          }`}>

          <div className="flex items-center justify-between">
            {/* Logo - No glow */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xs sm:text-sm">J+</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                JobFinder+
              </span>
            </Link>

            {/* Navigation links - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-dark-800/40 backdrop-blur-md rounded-full px-1.5 py-1 border border-dark-700/30">
              <a
                href="#home"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200"
              >
                Home
              </a>
              <a
                href="#how-it-works"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200"
              >
                How it Works
              </a>
              <a
                href="#pricing"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200"
              >
                Pricing
              </a>
            </div>

            {/* Auth buttons - Desktop (solid colors, no gradient) */}
            <div className="hidden sm:flex items-center gap-2">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-full text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-800/50 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-dark-400 hover:text-white hover:bg-dark-800/40 rounded-full transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Glassmorphism dropdown */}
      <div className={`sm:hidden absolute top-full left-0 right-0 mt-2 transition-all duration-300 ${mobileMenuOpen
        ? 'opacity-100 translate-y-0 pointer-events-auto'
        : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
        <div className="relative">
          <div className="absolute -inset-[0.5px] bg-orange-400/30 rounded-2xl" />
          <div className="relative bg-dark-900/80 backdrop-blur-xl rounded-2xl p-4 border border-dark-700/20">
            <div className="flex flex-col gap-1">
              <a
                href="#home"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#how-it-works"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </a>
              <a
                href="#pricing"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>

              <div className="h-px bg-dark-700/50 my-2" />

              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-3 rounded-xl bg-orange-500 text-white text-center text-sm font-semibold hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-3 rounded-xl text-dark-300 hover:text-white text-center text-sm font-medium border border-dark-700/50 hover:bg-dark-800/50 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-3 rounded-xl bg-orange-500 text-white text-center text-sm font-semibold hover:bg-orange-600 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
