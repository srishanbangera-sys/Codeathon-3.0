import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, BookOpen, CalendarDays, ClipboardList, Clock, BarChart3, FileText, Settings, LogOut, GraduationCap, Menu, X, Search, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/subjects', icon: BookOpen, label: 'Subjects' },
  { to: '/exams-assignments', icon: CalendarDays, label: 'Exams & Tasks' },
  { to: '/availability', icon: Clock, label: 'Availability' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/progress', icon: BarChart3, label: 'Analytics' },
  { to: '/summary', icon: FileText, label: 'Summary' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#051c24] text-white flex flex-col z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shrink-0`}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2dc1c1] flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide">LearnBuddy</span>
          <button className="ml-auto lg:hidden text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden px-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-[#0f3140] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#0a2530]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2dc1c1] rounded-r-full"></div>
                  )}
                  <item.icon size={18} className={isActive ? "text-[#2dc1c1]" : ""} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 mt-auto">
          <div className="flex flex-col gap-1 px-4 py-3 bg-[#0a2530] rounded-xl mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2dc1c1] flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-gray-400 hover:text-white hover:bg-[#0a2530] rounded-lg transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-10 sticky top-0">
          <div className="flex items-center flex-1 gap-4">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden text-gray-600">
              <Menu size={20} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden sm:flex items-center bg-gray-50/80 border border-gray-100 rounded-full px-4 py-2 w-full max-w-md focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-sm transition-all">
              <Search size={18} className="text-gray-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search subjects, tasks, or anything..." 
                className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
              />
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-1.5 py-0.5 ml-2 text-[10px] text-gray-400 font-medium tracking-wide">
                <span>Ctrl</span>
                <span>K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0 pl-4">
            <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
              <Bell size={20} />
              <span className="absolute 1 top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-gray-100">
              <div className="w-8 h-8 rounded-full bg-[#2dc1c1]/20 flex items-center justify-center text-sm font-bold text-[#1b8c8c]">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-24">
          <div className="max-w-[1400px] mx-auto h-full">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
