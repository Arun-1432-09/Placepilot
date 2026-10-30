import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon, Calendar, TrendingUp, Sparkles,
  ArrowRight, Award, Code2, Brain, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Sidebar } from '../components/common/Sidebar';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { assessmentsAPI } from '../services/api';
import { Assessment } from '../types';

export const History: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    assessmentsAPI.getHistory()
      .then((data) => {
        setAssessments(data);
        if (data.length > 0) {
          setExpandedId(data[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load history', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Sidebar>
        <LoadingSpinner message="Loading historical evaluations..." />
      </Sidebar>
    );
  }

  // Prepare line chart data (chronological order)
  const chartData = [...assessments]
    .reverse()
    .map((a, idx) => ({
      attempt: `#${idx + 1}`,
      date: new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      readiness: a.prediction ? Number(a.prediction.readiness_score.toFixed(1)) : 0,
      coding: a.coding_score,
      aptitude: a.aptitude_score,
    }));

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Assessment & Prediction History
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review your placement trajectory, score progression, and past ML evaluations over time.
            </p>
          </div>

          <Link
            to="/assessment/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Assessment</span>
          </Link>
        </div>

        {assessments.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No Evaluation History Found"
            description="You have not submitted any placement assessments yet. Take your first assessment to begin tracking your trajectory."
            actionText="Take First Assessment"
            onAction={() => (window.location.href = '/assessment/new')}
          />
        ) : (
          <>
            {/* Progress Trend Chart */}
            {chartData.length > 1 && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs mb-8">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Placement Readiness Trend Over Time
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tracking continuous model readiness probability across consecutive attempts.
                  </p>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="attempt" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="readiness"
                        name="Readiness %"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#4f46e5' }}
                        activeDot={{ r: 7 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="coding"
                        name="Coding Score"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* List of Past Assessments */}
            <div className="space-y-4">
              {assessments.map((item, index) => {
                const isExpanded = expandedId === item.id;
                const pred = item.prediction;
                const attemptNum = assessments.length - index;

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden transition"
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-xs text-brand-700 shrink-0">
                          #{attemptNum}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm text-slate-900">
                              Assessment Attempt #{attemptNum}
                            </h3>
                            <StatusBadge category={pred?.readiness_category} size="sm" />
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-medium">Model Readiness</p>
                          <p className="text-base font-extrabold text-slate-900">
                            {pred ? `${pred.readiness_score.toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
                        {/* 4 Score Chips */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                          <div className="p-3 rounded-xl bg-white border border-slate-200">
                            <span className="text-[11px] text-slate-400 block">CGPA</span>
                            <span className="text-sm font-bold text-slate-800">{item.cgpa.toFixed(2)}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200">
                            <span className="text-[11px] text-slate-400 block">Coding Fluency</span>
                            <span className="text-sm font-bold text-slate-800">{item.coding_score}/100</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200">
                            <span className="text-[11px] text-slate-400 block">Aptitude Score</span>
                            <span className="text-sm font-bold text-slate-800">{item.aptitude_score}/100</span>
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200">
                            <span className="text-[11px] text-slate-400 block">Portfolio</span>
                            <span className="text-sm font-bold text-slate-800">
                              {item.projects_count}P • {item.internships_count}I
                            </span>
                          </div>
                        </div>

                        {/* Strengths & Improvement Areas */}
                        {pred && (
                          <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs font-bold text-mint-800 mb-1.5">Strongest Areas:</p>
                              <div className="space-y-1">
                                {pred.strongest_areas.map((s, idx) => (
                                  <div key={idx} className="text-xs text-mint-900 bg-mint-50 px-2.5 py-1 rounded-md border border-mint-200">
                                    ✓ {s}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-amber-800 mb-1.5">Key Gaps:</p>
                              <div className="space-y-1">
                                {pred.improvement_areas.map((g, idx) => (
                                  <div key={idx} className="text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                    • {g}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Sidebar>
  );
};
