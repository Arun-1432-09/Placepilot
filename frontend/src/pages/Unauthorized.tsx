import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Access Denied</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-8">
        You do not have administrative credentials to view this area.
      </p>
      <Link
        to={user?.role === 'faculty' ? '/admin' : '/dashboard'}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Authorized Area</span>
      </Link>
    </div>
  );
};
