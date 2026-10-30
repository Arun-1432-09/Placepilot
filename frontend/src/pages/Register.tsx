import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User, Building2, Hash, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [regNumber, setRegNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Data Science & AI',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical & Electronics',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await register({
      full_name: fullName,
      email,
      password,
      role,
      reg_number: regNumber,
      department,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(res.error || 'Registration failed. Please check your inputs.');
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
          Create an account
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Begin tracking your placement readiness and insights
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-mint-50 border border-mint-200 text-mint-700 text-xs font-medium flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-mint-600 shrink-0" />
              <span>Account created successfully! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    role === 'student'
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    role === 'faculty'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Faculty / Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>
            </div>

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
                  placeholder="alex.mercer@college.edu"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {role === 'student' ? 'Registration / USN' : 'Faculty ID'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder={role === 'student' ? '2024CS0142' : 'FAC-001'}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition bg-white"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
