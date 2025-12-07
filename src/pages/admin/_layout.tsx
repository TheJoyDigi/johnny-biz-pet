import Link from 'next/link';
import { useRouter } from 'next/router';
import { createClient } from '@/utils/supabase/client';
import { useState, ReactNode, ElementType } from 'react';
import { Home, Users, LogOut, Menu, X, type LucideProps } from 'lucide-react';

interface NavLinkProps {
  href: string;
  icon: ElementType<LucideProps>;
  label: string;
}

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const NavLink = ({ href, icon: Icon, label }: NavLinkProps) => {
    const isActive = router.pathname === href || router.pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 bg-white border-r border-gray-200 z-50">
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200 bg-white">
          <span className="text-xl font-bold text-indigo-600 tracking-tight">Ruh-Roh Admin</span>
        </div>
        
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            <NavLink href="/admin" icon={Home} label="Dashboard" />
            <NavLink href="/admin/sitters" icon={Users} label="Sitters" />
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <span className="text-lg font-bold text-indigo-600">Ruh-Roh Admin</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-gray-800 bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg p-4" onClick={e => e.stopPropagation()}>
            <nav className="space-y-2">
              <NavLink href="/admin" icon={Home} label="Dashboard" />
              <NavLink href="/admin/sitters" icon={Users} label="Sitters" />
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="md:pl-64 pt-16 md:pt-0 min-h-screen transition-all duration-200">
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
