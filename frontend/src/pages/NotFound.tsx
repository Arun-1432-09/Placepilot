import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-6 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-8">
        The destination you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to PlacePilot</span>
      </Link>
    </div>
  );
};
