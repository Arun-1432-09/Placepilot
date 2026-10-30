import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, ArrowRight, AlertCircle, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      if (res.role === 'faculty') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  const fillDemo = (role: 'student' | 'faculty') => {
    setError(null);
    if (role === 'student') {
      setEmail('student@placepilot.edu');
      setPassword('Student@123');
    } else {
      setEmail('faculty@placepilot.edu');
      setPassword('Faculty@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-indigo-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            <Compass className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            Place<span className="text-brand-600">Pilot</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Sign in to access your placement dashboard and insights
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10">
          {/* Quick Demo Fill Pills */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Project Review Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50/40 transition shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('faculty')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/40 transition shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Demo Faculty</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@placepilot.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
