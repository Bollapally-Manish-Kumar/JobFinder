/**
 * Layout Component - Dashboard layout with sidebar navigation
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
  Menu,
  X,
  ClipboardList,
  Sparkles,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../hooks/useAuthStore';
import VerificationBadge from './VerificationBadge';

// Regular navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Job Match', href: '/ai-match', icon: Sparkles, premium: true },
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
    <div className="min-h-screen bg-dark-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-dark-800 border-r border-dark-700
        transform transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-dark-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">J+</span>
            </div>
            <span className="text-xl font-bold text-white">JobFinder+</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-dark-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                {/* Verification badge based on plan */}
                {user?.paymentVerified && user?.plan !== 'BASIC' && (
                  <VerificationBadge plan={user.plan} size="sm" />
                )}
              </div>
              {user?.paymentVerified && user?.plan !== 'BASIC' && (
                <div className="flex items-center gap-1 text-xs mt-0.5">
                  {user?.plan === 'PRO_PLUS' ? (
                    <span className="text-yellow-400">Pro Verified</span>
                  ) : user?.plan === 'AI' ? (
                    <span className="text-purple-400">AI Verified</span>
                  ) : (
                    <span className="text-blue-400">Verified User</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon className={`w-5 h-5 ${item.premium ? 'text-primary-400' : ''}`} />
                <span>{item.name}</span>
                {item.premium && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-primary-500/20 text-primary-400 rounded">
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
          
          {/* Admin link - only visible to admin (uses secret URL) */}
          {user?.email === ADMIN_EMAIL && (
            <Link
              to="/manage-jfp-9030405493"
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link border-t border-dark-600 mt-2 pt-2 ${location.pathname === '/manage-jfp-9030405493' ? 'active' : ''}`}
            >
              <Shield className="w-5 h-5 text-yellow-400" />
              <span>Admin: Payments</span>
              <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-yellow-500/20 text-yellow-400 rounded">
                ADMIN
              </span>
            </Link>
          )}
        </nav>

        {/* Logout button at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-dark-800/80 backdrop-blur-md border-b border-dark-700">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-dark-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1 lg:flex-none" />
            
            {/* Payment badge - show for free users or those with unverified payments */}
            {user?.role !== 'ADMIN' && (!user?.paymentVerified || user?.plan === 'BASIC') && (
              <Link
                to="/payment"
                className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:shadow-glow transition-all"
              >
                <span>From ₹10/mo</span>
                <span className="hidden sm:inline">- Upgrade Now</span>
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
