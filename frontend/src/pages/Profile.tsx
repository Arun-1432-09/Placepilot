import React, { useState, useEffect } from 'react';
import { User, Save, CheckCircle2, AlertCircle, Award, Code2, Brain, Briefcase } from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { studentsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StudentProfile } from '../types';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [regNumber, setRegNumber] = useState(user?.reg_number || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await studentsAPI.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load profile details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (field: keyof StudentProfile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      // 1. Update personal details (User model)
      const updatedUser = await authAPI.updateMe({
        full_name: fullName,
        reg_number: regNumber,
        department,
      });
      updateUser(updatedUser);

      // 2. Update student profile details (StudentProfile model)
      const updatedProfile = await studentsAPI.updateProfile(profile);
      setProfile(updatedProfile);

      setSuccessMsg('Student profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <Sidebar>
        <LoadingSpinner message="Loading profile..." />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Profile & Academic Record
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your updated academic credentials, self-evaluated assessment baselines, and project portfolio.
          </p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-mint-50 border border-mint-200 text-mint-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-mint-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Personal & Institutional Identity */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Identity & Registration</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Institutional)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration / USN / Roll Number
                </label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  value={profile.degree}
                  onChange={(e) => handleProfileChange('degree', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Academic Year
                </label>
                <select
                  value={profile.current_year}
                  onChange={(e) => handleProfileChange('current_year', parseInt(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition bg-white"
                >
                  <option value={1}>Year 1 (Freshman)</option>
                  <option value={2}>Year 2 (Sophomore)</option>
                  <option value={3}>Year 3 (Pre-final)</option>
                  <option value={4}>Year 4 (Final Year)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Academic & Numerical Baseline Scores */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-600" />
              <span>Academic Performance & Score Benchmarks</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cumulative CGPA (0.0 - 10.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={profile.cgpa}
                  onChange={(e) => handleProfileChange('cgpa', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Backlogs Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  required
                  value={profile.backlogs_count}
                  onChange={(e) => handleProfileChange('backlogs_count', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coding / Problem Solving (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={profile.coding_score}
                  onChange={(e) => handleProfileChange('coding_score', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technical Knowledge Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={profile.technical_score}
                  onChange={(e) => handleProfileChange('technical_score', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aptitude & Quantitative (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={profile.aptitude_score}
                  onChange={(e) => handleProfileChange('aptitude_score', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Communication Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={profile.communication_score}
                  onChange={(e) => handleProfileChange('communication_score', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Experience & Practical Portfolio */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-600" />
              <span>Practical Portfolio & Readiness</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Projects Completed
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={profile.projects_count}
                  onChange={(e) => handleProfileChange('projects_count', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internships Completed
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={profile.internships_count}
                  onChange={(e) => handleProfileChange('internships_count', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certifications Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  required
                  value={profile.certifications_count}
                  onChange={(e) => handleProfileChange('certifications_count', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume Readiness (Self-evaluated 0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={profile.resume_readiness}
                  onChange={(e) => handleProfileChange('resume_readiness', parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interview Preparation Level
                </label>
                <select
                  value={profile.interview_prep_level}
                  onChange={(e) => handleProfileChange('interview_prep_level', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition bg-white"
                >
                  <option value="Beginner">Beginner (Reviewing basic concepts)</option>
                  <option value="Intermediate">Intermediate (Practicing standard questions)</option>
                  <option value="Advanced">Advanced (Timed mock interview ready)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Technical Skills & Tools (Comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.technical_skills}
                  onChange={(e) => handleProfileChange('technical_skills', e.target.value)}
                  placeholder="e.g. Python, SQL, React, Data Structures, Git, Docker"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
};
