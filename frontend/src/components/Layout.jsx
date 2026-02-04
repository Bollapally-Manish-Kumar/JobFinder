/**
 * Layout Component - Modern dashboard layout with glassmorphic sidebar
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  CreditCard,
  LogOut,
  Search,
  BadgeCheck,
  Menu,
  X,
  ClipboardList,
  Sparkles,
  Shield,
  User,
  ChevronRight,
  Bell,
  Settings,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';

// Regular navigation items - grouped for cleaner UI
const coreNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AxonApply™', href: '/axon-apply', icon: Zap, badge: 'SOON', highlight: true },
];

const toolsNav = [
  { name: 'AxonMatch™', href: '/ai-match', icon: Sparkles, badge: 'PRO' },
  { name: 'AxonResume™', href: '/resume-builder', icon: FileText },
];

const accountNav = [
  { name: 'Saved Jobs', href: '/saved-jobs', icon: Bookmark },
  { name: 'My Applications', href: '/my-applications', icon: ClipboardList },
  { name: 'Profile', href: '/profile', icon: User },
];

// Admin email - only this user sees admin panel
const ADMIN_EMAIL = 'admin@jobfinder.com';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Polished Premium Design (Orange Theme) */}
      <aside className={`
        fixed top-4 left-4 z-50 h-[calc(100vh-32px)] w-72 bg-[#0F1115] border border-dark-800/80
        rounded-3xl shadow-2xl shadow-black/40 overflow-hidden
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="flex items-center gap-3 h-20 px-6 mb-2 border-b border-dark-800/50">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/favicon.svg" alt="GoAxonAI" className="w-9 h-9 group-hover:scale-105 transition-transform" />
            <span className="text-lg font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors">
              GoAxon<span className="text-orange-500">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-dark-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Wrapper */}
        <div className="px-4 py-6 space-y-6 overflow-y-auto h-[calc(100vh-160px)] scrollbar-hide">

          {/* Core Menu */}
          <div>
            <div className="space-y-1">
              {coreNav.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : item.highlight
                        ? 'text-orange-400 hover:text-white hover:bg-orange-500/10 border border-orange-500/30 bg-orange-500/5'
                        : 'text-dark-400 hover:text-white hover:bg-dark-800'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-orange-400' : 'text-dark-400'}`} />
                    <span>{item.name}</span>
                    {item.badge && !isActive && (
                      <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.badge === 'SOON' 
                          ? 'text-black bg-gradient-to-r from-orange-400 to-yellow-400' 
                          : 'text-orange-400 bg-orange-500/10 border border-orange-500/20'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* AI Tools */}
          <div>
            <div className="text-[11px] font-bold text-dark-500 px-3 uppercase tracking-wider mb-3">AI Tools</div>
            <div className="space-y-1">
              {toolsNav.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-dark-400 hover:text-white hover:bg-dark-800'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-dark-400'}`} />
                    <span>{item.name}</span>
                    {item.badge && !isActive && (
                      <span className="ml-auto text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 opacity-70">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="text-[11px] font-bold text-dark-500 px-3 uppercase tracking-wider mb-3">Account</div>
            <div className="space-y-1">
              {accountNav.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-dark-400 hover:text-white hover:bg-dark-800'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-dark-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Admin Section */}
          {(user?.email === ADMIN_EMAIL || user?.role === 'ADMIN') && (
            <div>
              <div className="text-[11px] font-bold text-dark-500 px-3 uppercase tracking-wider mb-3">Admin</div>
              <div className="space-y-1">
                <Link
                  to="/admin-dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${location.pathname === '/admin-dashboard'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                    }
                    `}
                >
                  <Shield className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/manage-jfp-9030405493"
                  onClick={() => setSidebarOpen(false)}
                  className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${location.pathname === '/manage-jfp-9030405493'
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white shadow-lg shadow-yellow-500/20'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                    }
                    `}
                >
                  <Shield className="w-4 h-4" />
                  <span>Legacy</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom User Section - Floating Card */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-dark-800/50 backdrop-blur-md border border-dark-700/50 rounded-2xl p-3 flex items-center gap-3 group hover:border-dark-600 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-dark-400 truncate flex items-center gap-1">
                <p>
                  {user?.role === 'ADMIN' ? 'Administrator' :
                    user?.plan === 'ULTIMATE' ? 'Ultimate Plan' :
                      user?.plan === 'PRO_PLUS' ? 'Pro Plus' :
                        user?.plan === 'AI' ? 'AI Plan' :
                          user?.plan === 'BASIC_PLUS' ? 'Basic Plus' :
                            'Free Plan'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main content */}
      <div className="lg:pl-[20rem] flex flex-col h-screen pt-4 pr-4 pb-4">
        {/* Top header */}
        <header className="sticky top-4 z-30 h-16 bg-[#0F1115]/80 backdrop-blur-md border border-dark-800/60 rounded-2xl shadow-lg shadow-black/20">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Center Area - Tagline (Visible on all devices, centered on mobile) */}
            <div className="flex-1 flex justify-center items-center pointer-events-none">
              <div
                className="text-lg md:text-xl text-white opacity-90 transition-opacity"
                style={{
                  fontFamily: '"Dancing Script", cursive',
                  WebkitTextStroke: '0.5px rgba(249, 115, 22, 0.6)',
                  textShadow: '0 0 1px rgba(249, 115, 22, 0.3)'
                }}
              >
                We find the jobs you miss.
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Date Display */}
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-dark-400 border-l border-dark-800 pl-4 ml-1">
                <span className="text-white">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => toast('Auto Apply Agent coming soon!', { duration: 3000 })}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all relative group"
              >
                <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-[#0F1115]" />
                <Bell className="w-5 h-5" />
              </button>

              {!user?.role === 'ADMIN' && (
                <button className="p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all">
                  <Settings className="w-5 h-5" />
                </button>
              )}

              {/* Payment badge - only for non-premium */}
              {user?.role !== 'ADMIN' && (!user?.paymentVerified || user?.plan === 'BASIC') && (
                <Link
                  to="/payment"
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:scale-[1.02] transition-all ml-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page content - scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 mt-4 rounded-2xl border border-dark-800/60 bg-[#0F1115]/60 shadow-xl shadow-black/20">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
