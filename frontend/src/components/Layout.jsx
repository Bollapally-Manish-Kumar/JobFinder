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
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../hooks/useAuthStore';

// Regular navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Job Match', href: '/ai-match', icon: Sparkles, premium: true },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'My Applications', href: '/my-applications', icon: ClipboardList },
  { name: 'Saved Jobs', href: '/saved-jobs', icon: Bookmark },
  { name: 'Resume Builder', href: '/resume-builder', icon: FileText },
  { name: 'Payment', href: '/payment', icon: CreditCard },
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
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-900 to-dark-800">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-dark-800/95 backdrop-blur-xl border-r border-dark-700/50
        transform transition-transform duration-300 lg:translate-x-0 shadow-2xl shadow-black/20
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-dark-700/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <span className="text-white font-bold text-base">J+</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-dark-300 bg-clip-text text-transparent">JobFinder+</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-5 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'User'}
                </p>
                {/* Badge based on plan */}
                {user?.paymentVerified && user?.plan === 'ULTIMATE' && (
                  <>
                    {/* Emerald badge for Ultimate (₹50) */}
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold text-[8px]">∞</span>
                    </div>
                  </>
                )}
                {user?.paymentVerified && user?.plan === 'PRO_PLUS' && (
                  <>
                    {/* Crown badge for Pro Plus (₹30) */}
                    <BadgeCheck className="w-4 h-4 text-orange-400" />
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-[8px]">★</span>
                    </div>
                  </>
                )}
                {user?.paymentVerified && user?.plan === 'AI' && (
                  <>
                    {/* Gold badge for AI plan (₹20) */}
                    <BadgeCheck className="w-4 h-4 text-yellow-400" />
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold text-[8px]">AI</span>
                    </div>
                  </>
                )}
                {user?.paymentVerified && user?.plan === 'BASIC_PLUS' && (
                  /* Blue badge for Basic Plus (₹10) */
                  <BadgeCheck className="w-4 h-4 text-blue-400" />
                )}
              </div>
              {user?.paymentVerified && user?.plan !== 'BASIC' && (
                <div className="flex items-center gap-1.5 text-xs mt-1">
                  {user?.plan === 'ULTIMATE' ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-medium">Ultimate</span>
                  ) : user?.plan === 'PRO_PLUS' ? (
                    <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 font-medium">Pro Plus</span>
                  ) : user?.plan === 'AI' ? (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 font-medium">AI Pro</span>
                  ) : user?.plan === 'BASIC_PLUS' ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-medium">Plus</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-dark-600/50 text-dark-400 font-medium">Free</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-dark-700/50 border border-dark-600/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-dark-500 focus:outline-none focus:border-primary-500/50 focus:bg-dark-700 transition-all"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-2 flex-1 overflow-y-auto">
          <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary-500/15 to-orange-500/10 text-primary-400 shadow-lg shadow-primary-500/5' 
                    : 'text-dark-400 hover:bg-dark-700/50 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive || item.premium ? 'text-primary-400' : ''}`} />
                <span className="flex-1">{item.name}</span>
                {item.premium && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-primary-500 to-orange-500 text-white rounded-md shadow-sm">
                    PRO
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-primary-400" />}
              </Link>
            );
          })}
          </div>
          
          {/* Admin link - only visible to admin */}
          {(user?.role === 'ADMIN' || user?.email === ADMIN_EMAIL) && (
            <>
              <Link
                to="/admin-dashboard"
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link border-t border-dark-600 mt-2 pt-2 ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}
              >
                <Shield className="w-5 h-5 text-green-400" />
                <span>Admin Dashboard</span>
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-400 rounded">
                  NEW
                </span>
              </Link>
              <Link
                to="/manage-jfp-9030405493"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/manage-jfp-9030405493' 
                    ? 'bg-gradient-to-r from-yellow-500/15 to-orange-500/10 text-yellow-400' 
                    : 'text-dark-400 hover:bg-dark-700/50 hover:text-white'
                }`}
              >
                <Shield className="w-5 h-5 text-yellow-400" />
                <span>Legacy Payments</span>
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded-md">
                  ADMIN
                </span>
              </Link>
            </>
          )}
        </nav>

        {/* Logout button at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700/50 bg-dark-800/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-dark-400 hover:text-white hover:bg-dark-800/50 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1 lg:flex-none" />
            
            {/* Payment badge - show for free users or those with unverified payments */}
            {user?.role !== 'ADMIN' && (!user?.paymentVerified || user?.plan === 'BASIC') && (
              <Link
                to="/payment"
                className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Upgrade from</span>
                <span>₹10/mo</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
