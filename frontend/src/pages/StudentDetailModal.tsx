import React from 'react';
import { X, User, Mail, Hash, Building2, Calendar, Award, Code2, Brain, CheckCircle2 } from 'lucide-react';
import { StudentDetail } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

interface StudentDetailModalProps {
  student: StudentDetail | null;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  if (!student) return null;

  const { user, profile, assessments, recommendations } = student;
  const latestAssessment = assessments.length > 0 ? assessments[0] : null;
  const latestPrediction = latestAssessment?.prediction;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
              {user.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{user.full_name}</h2>
                <StatusBadge category={latestPrediction?.readiness_category} size="sm" />
              </div>
              <p className="text-xs text-slate-400">
                {user.department || 'General Engineering'} • PRN: {user.reg_number || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">CGPA</span>
              <span className="text-xl font-black text-slate-900">
                {profile?.cgpa.toFixed(2) || latestAssessment?.cgpa.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Coding</span>
              <span className="text-xl font-black text-slate-900">
                {latestAssessment ? `${latestAssessment.coding_score}/100` : profile ? `${profile.coding_score}/100` : 'N/A'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Aptitude</span>
              <span className="text-xl font-black text-slate-900">
                {latestAssessment ? `${latestAssessment.aptitude_score}/100` : profile ? `${profile.aptitude_score}/100` : 'N/A'}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Readiness</span>
              <span className="text-xl font-black text-brand-600">
                {latestPrediction ? `${latestPrediction.readiness_score.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Practical Experience and Skills */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Projects Completed:</span>
              <span className="font-bold">{profile?.projects_count || 0} Projects</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Internships Completed:</span>
              <span className="font-bold">{profile?.internships_count || 0} Internships</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Active Backlogs:</span>
              <span className={`font-bold ${(profile?.backlogs_count || 0) > 0 ? 'text-rose-600' : 'text-mint-700'}`}>
                {profile?.backlogs_count || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Technical Skills:</span>
              <span className="font-bold">{profile?.technical_skills || 'Not specified'}</span>
            </div>
          </div>

          {/* Assessment History */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Assessment Runs ({assessments.length} Total)
            </h3>
            {assessments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No assessments submitted yet.</p>
            ) : (
              <div className="space-y-2">
                {assessments.map((a, idx) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">Attempt #{assessments.length - idx}</span>
                      <span className="text-slate-400 ml-2">
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">
                        {a.prediction ? `${a.prediction.readiness_score.toFixed(1)}%` : 'N/A'}
                      </span>
                      <StatusBadge category={a.prediction?.readiness_category} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
