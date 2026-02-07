/**
 * Navbar Component - Modern floating navbar with glassmorphism
 */

import { Link } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronDown, Brain, Wrench, Rocket, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../hooks/useAuthStore';

function Navbar() {
  const { user, token } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const productsRef = useRef(null);

  const isLoggedIn = token && user;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productsRef.current && !productsRef.current.contains(event.target)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
              <img src="/logo.png" alt="GoAxonAI Logo" className="w-8 h-8 sm:w-9 sm:h-9 group-hover:scale-105 transition-transform duration-300" />
              <span className="text-base sm:text-lg font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                GoAxon<span className="text-orange-500">AI</span>
              </span>
            </Link>

            {/* Navigation links - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-dark-800/40 backdrop-blur-md rounded-full px-1.5 py-1 border border-dark-700/30">
              {/* Products Dropdown */}
              <div className="relative" ref={productsRef}>
                <button
                  onClick={() => setProductsOpen(!productsOpen)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200 flex items-center gap-1"
                >
                  Products
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {productsOpen && (
                  <div className="absolute top-full left-0 mt-3 w-80 bg-dark-900/95 backdrop-blur-xl rounded-2xl border border-dark-700/50 shadow-2xl shadow-black/50 p-4 z-50">
                    <div className="space-y-1">
                      {/* AxonMatch */}
                      <Link
                        to="/ai-match"
                        onClick={() => setProductsOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors">AxonMatch™</h4>
                          <p className="text-dark-400 text-xs mt-0.5">AI-powered job matching based on your skills and preferences.</p>
                        </div>
                      </Link>
                      
                      {/* AxonResume */}
                      <Link
                        to="/resume-builder"
                        onClick={() => setProductsOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors">AxonResume™</h4>
                          <p className="text-dark-400 text-xs mt-0.5">ATS-optimized resume builder with AI assistance.</p>
                        </div>
                      </Link>
                      
                      {/* AxonApply - Coming Soon */}
                      <Link
                        to="/axon-apply"
                        onClick={() => setProductsOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                          <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors">AxonApply™</h4>
                            <span className="text-[10px] font-bold bg-orange-500 text-black px-2 py-0.5 rounded-full">Coming Soon</span>
                          </div>
                          <p className="text-dark-400 text-xs mt-0.5">One-click job applications with AI auto-fill.</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <a
                href="#how-it-works"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200"
              >
                About
              </a>
              <a
                href="#pricing"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200"
              >
                Pricing
              </a>
              <Link
                to="/disclaimer"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200"
              >
                Contact
              </Link>
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
              {/* Products Section */}
              <div className="px-4 py-2 text-xs font-bold text-dark-500 uppercase tracking-wider">Products</div>
              <Link
                to="/ai-match"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Brain className="w-4 h-4 text-purple-400" />
                AxonMatch™
              </Link>
              <Link
                to="/resume-builder"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="w-4 h-4 text-blue-400" />
                AxonResume™
              </Link>
              <Link
                to="/axon-apply"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium flex items-center gap-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Rocket className="w-4 h-4 text-orange-400" />
                AxonApply™
                <span className="text-[10px] font-bold bg-orange-500 text-black px-2 py-0.5 rounded-full ml-auto">Soon</span>
              </Link>

              <div className="h-px bg-dark-700/50 my-2" />

              <a
                href="#how-it-works"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#pricing"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Link
                to="/disclaimer"
                className="px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors duration-200 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

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
