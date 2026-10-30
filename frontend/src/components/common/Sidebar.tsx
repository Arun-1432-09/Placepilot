import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass, LayoutDashboard, Sparkles, History, CheckSquare,
  User, Users, LogOut, Menu, X, ChevronRight, BarChart3, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isStudent = user?.role === 'student';

  const studentNavItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Take Assessment', path: '/assessment/new', icon: Sparkles, highlight: true },
    { name: 'Assessment History', path: '/history', icon: History },
    { name: 'Recommendations', path: '/recommendations', icon: CheckSquare },
    { name: 'Student Profile', path: '/profile', icon: User },
  ];

  const facultyNavItems: NavItem[] = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Student Directory', path: '/admin/students', icon: Users },
  ];

  const navItems: NavItem[] = isStudent ? studentNavItems : facultyNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-navy-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-navy-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">PlacePilot</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-navy-950 text-slate-200 flex flex-col justify-between border-r border-navy-800/80 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 p-5">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-navy-800/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">
                  Place<span className="text-brand-400">Pilot</span>
                </h1>
                <span className="text-[11px] font-medium text-slate-400">
                  Campus AI System
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-xl bg-navy-900/90 border border-navy-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center font-bold text-indigo-300 text-sm">
              {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.department || user?.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isStudent
                      ? 'bg-brand-900/80 text-brand-300 border border-brand-700/60'
                      : 'bg-emerald-950 text-mint-400 border border-emerald-700/60'
                  }`}
                >
                  <Shield className="w-2.5 h-2.5" />
                  {isStudent ? 'Student Account' : 'Faculty Admin'}
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
              {isStudent ? 'Placement Journey' : 'Administration'}
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                      : item.highlight
                      ? 'bg-brand-950/70 text-brand-300 hover:bg-brand-900/50 border border-brand-800/40'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-navy-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        ></div>
      )}
    </div>
  );
};
