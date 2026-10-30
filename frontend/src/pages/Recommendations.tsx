import React, { useEffect, useState } from 'react';
import {
  CheckSquare, Square, CheckCircle2, Clock, Filter,
  Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { recommendationsAPI } from '../services/api';
import { Recommendation } from '../types';

export const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await recommendationsAPI.getAll();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      const updated = await recommendationsAPI.toggle(id);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    } catch (err) {
      console.error('Failed to toggle recommendation', err);
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <LoadingSpinner message="Loading personalized preparation tasks..." />
      </Sidebar>
    );
  }

  const completedCount = recommendations.filter((r) => r.is_completed).length;
  const totalCount = recommendations.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredRecs = recommendations.filter((r) => {
    if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
    if (statusFilter === 'Pending' && r.is_completed) return false;
    if (statusFilter === 'Completed' && !r.is_completed) return false;
    return true;
  });

  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Personalized Preparation Task Hub
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Data-driven action items generated directly from your assessment skill gaps. Check off tasks as you complete them.
            </p>
          </div>
        </div>

        {/* Progress Overview Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Overall Preparation Progress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{progressPercent}%</span>
              <span className="text-xs text-slate-500">
                ({completedCount} of {totalCount} tasks completed)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Clearing High Priority tasks significantly elevates placement readiness scores.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white border border-slate-200/80">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Priority:</span>
            {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  priorityFilter === p
                    ? 'bg-brand-600 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span>Status:</span>
            {(['All', 'Pending', 'Completed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendations List */}
        {filteredRecs.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No Matching Action Items"
            description={
              totalCount === 0
                ? 'Complete an assessment to generate your personalized preparation checklist.'
                : 'No tasks match your selected filter criteria.'
            }
            actionText={totalCount === 0 ? 'Take Assessment' : undefined}
            onAction={totalCount === 0 ? () => (window.location.href = '/assessment/new') : undefined}
          />
        ) : (
          <div className="space-y-3.5">
            {filteredRecs.map((rec) => {
              const isDone = rec.is_completed;
              return (
                <div
                  key={rec.id}
                  onClick={() => handleToggle(rec.id)}
                  className={`p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 group ${
                    isDone
                      ? 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-80'
                      : 'bg-white border-slate-200 hover:border-brand-300 hover:shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 text-slate-400 group-hover:text-brand-600 transition"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-mint-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`text-sm font-bold ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {rec.area}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          rec.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : rec.priority === 'Medium'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {rec.priority} Priority
                      </span>

                      {isDone && (
                        <span className="text-[10px] font-semibold text-mint-700 bg-mint-50 px-2 py-0.5 rounded border border-mint-200">
                          Completed on {rec.completed_at ? new Date(rec.completed_at).toLocaleDateString() : 'Today'}
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-xs leading-relaxed ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-700 font-medium'
                      }`}
                    >
                      {rec.action}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-2 italic">
                      Diagnostic Reason: {rec.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Sidebar>
  );
};
