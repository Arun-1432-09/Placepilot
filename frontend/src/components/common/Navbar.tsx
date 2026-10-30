import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Place<span className="text-brand-600">Pilot</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200/50">
                AI System
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Your Journey to Placement Starts Here.
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-brand-600 transition">Features</a>
          <a href="#ml-pipeline" className="hover:text-brand-600 transition">ML Engine</a>
          <a href="#role-comparison" className="hover:text-brand-600 transition">Portals</a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to={user.role === 'faculty' ? '/admin' : '/dashboard'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition hover:shadow"
            >
              <UserIcon className="w-4 h-4" />
              <span>Go to {user.role === 'faculty' ? 'Faculty Portal' : 'Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition hover:shadow"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
