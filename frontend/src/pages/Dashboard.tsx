import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle2, TrendingUp, AlertTriangle,
  Code2, Brain, Award, Briefcase, FileText, Calendar, Compass,
  CheckSquare, Square
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { studentsAPI, recommendationsAPI } from '../services/api';
import { StudentDashboardSummary, Recommendation } from '../types';
import { Sidebar } from '../components/common/Sidebar';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await studentsAPI.getDashboard();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load dashboard data. Ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleRec = async (id: number) => {
    try {
      setTogglingId(id);
      await recommendationsAPI.toggle(id);
      // Refresh recommendations locally
      setData((prev) => {
        if (!prev) return prev;
        const updatedRecs = prev.recommendations.map((r) =>
          r.id === id ? { ...r, is_completed: !r.is_completed } : r
        );
        const completedCount = updatedRecs.filter((r) => r.is_completed).length;
        return {
          ...prev,
          recommendations: updatedRecs,
          completed_recommendations_count: completedCount,
        };
      });
    } catch (err) {
      console.error('Failed to toggle recommendation status', err);
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <LoadingSpinner message="Loading your placement insights..." />
      </Sidebar>
    );
  }

  if (error || !data) {
    return (
      <Sidebar>
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700">
          <p className="font-semibold">{error || 'Unable to load dashboard'}</p>
          <button
            onClick={fetchDashboard}
            className="mt-3 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-rose-300 hover:bg-rose-100 transition"
          >
            Retry Loading
          </button>
        </div>
      </Sidebar>
    );
  }

  const { user, profile, latest_assessment, latest_prediction, recommendations } = data;

  // Prepare skill radar data
  const radarData = latest_assessment
    ? [
        { skill: 'Coding', score: latest_assessment.coding_score, fullMark: 100 },
        { skill: 'Technical', score: latest_assessment.technical_score, fullMark: 100 },
        { skill: 'Aptitude', score: latest_assessment.aptitude_score, fullMark: 100 },
        { skill: 'Communication', score: latest_assessment.communication_score, fullMark: 100 },
        { skill: 'Resume', score: latest_assessment.resume_readiness, fullMark: 100 },
      ]
    : [];

  return (
    <Sidebar>
      {/* Top Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hello, {user.full_name.split(' ')[0]} 👋
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/80">
              {profile?.degree || 'B.Tech'} • Year {profile?.current_year || 4}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {user.department || 'Engineering Department'} • Reg: {user.reg_number || 'N/A'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
          >
            Edit Profile
          </Link>
          <Link
            to="/assessment/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition hover:shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Take Assessment</span>
          </Link>
        </div>
      </div>

      {!latest_assessment ? (
        /* Empty State */
        <EmptyState
          icon={Compass}
          title="No Placement Assessment Completed Yet"
          description="Take your first multi-dimensional assessment to calculate your real machine-learning placement readiness, identify skill gaps, and generate customized preparation actions."
          actionText="Start First Assessment"
          onAction={() => (window.location.href = '/assessment/new')}
        />
      ) : (
        <>
          {/* Main Highlight Readiness Card */}
          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-indigo-950 text-white shadow-xl shadow-navy-950/10 border border-navy-800 relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="max-w-xl">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Latest ML Evaluation
                  </span>
                  <StatusBadge category={latest_prediction?.readiness_category} size="sm" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                  Status: {latest_prediction?.readiness_category}
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {latest_prediction?.readiness_category === 'Placement Ready'
                    ? 'Excellent job! Your core fundamentals, problem solving, and portfolio strongly align with institutional campus placement benchmarks.'
                    : latest_prediction?.readiness_category === 'Developing'
                    ? 'Good foundation established. Targeted focus on algorithmic problem solving and interview polish will elevate your profile to Placement Ready.'
                    : 'Fundamental gaps detected across aptitude and technical domains. Prioritize the personalized action items below to accelerate readiness.'}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    Assessed on {new Date(latest_assessment.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Attempt #{data.assessment_count}</span>
                </div>
              </div>

              {/* Confidence Score Circle */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm self-start lg:self-center shrink-0 w-full sm:w-auto">
                <div className="relative flex items-center justify-center w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`${
                        latest_prediction?.readiness_category === 'Placement Ready'
                          ? 'text-mint-400'
                          : latest_prediction?.readiness_category === 'Developing'
                          ? 'text-brand-400'
                          : 'text-rose-400'
                      }`}
                      strokeDasharray={`${latest_prediction?.readiness_score || 0}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-white">
                      {latest_prediction?.readiness_score.toFixed(0)}%
                    </span>
                    <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Readiness
                    </span>
                  </div>
                </div>
                <Link
                  to="/results"
                  className="mt-3 text-xs font-semibold text-brand-300 hover:text-white transition flex items-center gap-1"
                >
                  <span>View Full ML Breakdown</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Academic CGPA</span>
                <Award className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{latest_assessment.cgpa.toFixed(2)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Scale of 10.0</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Coding Fluency</span>
                <Code2 className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{latest_assessment.coding_score.toFixed(0)}/100</p>
              <p className="text-[11px] text-slate-500 mt-1">DSA & Problem Solving</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Aptitude Score</span>
                <Brain className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{latest_assessment.aptitude_score.toFixed(0)}/100</p>
              <p className="text-[11px] text-slate-500 mt-1">Quantitative & Logic</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Industry Exposure</span>
                <Briefcase className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {latest_assessment.projects_count}P • {latest_assessment.internships_count}I
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {latest_assessment.certifications_count} Certified Skill(s)
              </p>
            </div>
          </div>

          {/* Middle Row: Radar Chart + Key Strengths/Gaps */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Radar Skill Distribution Chart */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Skill Distribution Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Radar map of your performance across the 5 core placement pillars
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#4f46e5"
                      fill="#6366f1"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-center text-xs text-slate-400">
                Balanced polygons indicate multi-faceted interview readiness.
              </div>
            </div>

            {/* Strengths and Improvement Areas */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4">
                  Assessment Diagnosis
                </h3>

                {/* Strongest Areas */}
                <div className="mb-6">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-mint-700 uppercase tracking-wider mb-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Your Strongest Areas</span>
                  </div>
                  <div className="space-y-2">
                    {latest_prediction?.strongest_areas.map((area, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-2 rounded-xl bg-mint-50/70 border border-mint-200/60 text-xs font-semibold text-mint-900 flex items-center justify-between"
                      >
                        <span>{area}</span>
                        <span className="text-[10px] uppercase font-bold text-mint-600 bg-white px-2 py-0.5 rounded-md border border-mint-200">
                          Strength
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas Needing Improvement */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Critical Improvement Focus</span>
                  </div>
                  <div className="space-y-2">
                    {latest_prediction?.improvement_areas.map((area, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs font-semibold text-amber-900 flex items-center justify-between"
                      >
                        <span>{area}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-600 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                          Focus
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Backlogs: {latest_assessment.backlogs_count}</span>
                <span className="text-slate-500">Interview Prep: {latest_assessment.interview_prep_level}</span>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations Checklist */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Personalized Preparation Roadmap
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Action items tailored directly to your specific score gaps. Complete them to elevate readiness.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  {data.completed_recommendations_count} of {data.total_recommendations_count} completed
                </span>
                <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        data.total_recommendations_count > 0
                          ? (data.completed_recommendations_count / data.total_recommendations_count) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No active recommendations. Great work keeping on track!
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.slice(0, 4).map((rec) => {
                  const isCompleted = rec.is_completed;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => handleToggleRec(rec.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 group ${
                        isCompleted
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-80'
                          : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-2xs'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-slate-400 group-hover:text-brand-600 transition"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-mint-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold ${
                              isCompleted ? 'line-through text-slate-500' : 'text-slate-800'
                            }`}
                          >
                            {rec.area}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              rec.priority === 'High'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                : rec.priority === 'Medium'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {rec.action}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          Why: {rec.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {recommendations.length > 4 && (
                  <div className="pt-2 text-center">
                    <Link
                      to="/recommendations"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
                    >
                      View all {recommendations.length} action items →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </Sidebar>
  );
};
