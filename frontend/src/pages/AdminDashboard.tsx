import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Award, Brain, Code2, Download, TrendingUp, CheckCircle2,
  Clock, AlertTriangle, ArrowRight, ShieldCheck, BarChart3, PieChart
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import { Sidebar } from '../components/common/Sidebar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { adminAPI } from '../services/api';
import { AdminStats } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await adminAPI.downloadCSV();
    } catch (err) {
      console.error('CSV export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <LoadingSpinner message="Aggregating institutional placement analytics..." />
      </Sidebar>
    );
  }

  if (!stats) {
    return (
      <Sidebar>
        <EmptyState
          icon={BarChart3}
          title="No Analytics Data Available"
          description="Analytics will appear once student accounts are registered and evaluations are taken."
        />
      </Sidebar>
    );
  }

  const {
    total_students, assessed_students, unassessed_students,
    total_assessments, avg_cgpa, avg_technical_score, avg_coding_score,
    avg_aptitude_score, readiness_distribution, department_summary
  } = stats;

  // Donut chart data for readiness distribution
  const pieData = [
    { name: 'Placement Ready', value: readiness_distribution.placement_ready, color: '#10b981' },
    { name: 'Developing', value: readiness_distribution.developing, color: '#6366f1' },
    { name: 'Needs Preparation', value: readiness_distribution.needs_preparation, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  // Department chart data
  const deptData = department_summary.map((d) => ({
    name: d.department.length > 18 ? d.department.slice(0, 15) + '...' : d.department,
    fullName: d.department,
    Students: d.student_count,
    Assessed: d.assessed_count,
    Ready: d.placement_ready_count,
    cgpa: d.avg_cgpa,
  }));

  // Average competency scores for horizontal bar chart
  const competencyData = [
    { name: 'Coding Fluency', score: avg_coding_score, benchmark: 75 },
    { name: 'Technical Fundamentals', score: avg_technical_score, benchmark: 75 },
    { name: 'Aptitude & Quantitative', score: avg_aptitude_score, benchmark: 70 },
  ];

  return (
    <Sidebar>
      <div className="py-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Faculty Placement Intelligence
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-mint-700 border border-emerald-200">
                Live DB Metrics
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Institutional oversight across departments, readiness status distributions, and exportable reports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/students"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Student Directory</span>
            </Link>

            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export CSV Report'}</span>
            </button>
          </div>
        </div>

        {/* 4 Overview KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 block mb-1">Total Registered</span>
            <p className="text-3xl font-black text-slate-900">{total_students}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              {assessed_students} assessed ({total_students > 0 ? Math.round((assessed_students / total_students) * 100) : 0}%)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 block mb-1">Total Assessments Run</span>
            <p className="text-3xl font-black text-slate-900">{total_assessments}</p>
            <p className="text-[11px] text-brand-600 font-medium mt-1">
              Active ML evaluations
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 block mb-1">Average CGPA</span>
            <p className="text-3xl font-black text-slate-900">{avg_cgpa.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Institutional cohort</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 block mb-1">Avg Coding Score</span>
            <p className="text-3xl font-black text-slate-900">{avg_coding_score.toFixed(1)}/100</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">
              Problem solving fluency
            </p>
          </div>
        </div>

        {/* Charts Row: Readiness Distribution + Department Breakdown */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Donut Chart: Readiness Distribution */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Readiness Distribution
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Classification outcomes of assessed students
              </p>
            </div>

            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No assessments completed yet.</p>
            ) : (
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-mint-500 inline-block mb-1" />
                <p className="text-xs font-bold text-slate-900">{readiness_distribution.placement_ready}</p>
                <p className="text-[10px] text-slate-400 uppercase">Ready</p>
              </div>
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block mb-1" />
                <p className="text-xs font-bold text-slate-900">{readiness_distribution.developing}</p>
                <p className="text-[10px] text-slate-400 uppercase">Developing</p>
              </div>
              <div>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mb-1" />
                <p className="text-xs font-bold text-slate-900">{readiness_distribution.needs_preparation}</p>
                <p className="text-[10px] text-slate-400 uppercase">Needs Prep</p>
              </div>
            </div>
          </div>

          {/* Department Breakdown Bar Chart */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Department Performance & Assessment Counts
              </h3>
              <p className="text-xs text-slate-500">
                Comparing total enrolled students versus verified assessments and placement ready counts
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="Students" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Assessed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ready" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                Total Students
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                Assessed Runs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-mint-500" />
                Placement Ready
              </span>
            </div>
          </div>
        </div>

        {/* Lower Row: Average Competencies Bar Chart & Institutional Export Banner */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Competency Score Benchmarks */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Cohort Competency Averages
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Average scores attained across evaluated institutional candidates
            </p>

            <div className="space-y-5">
              {competencyData.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{item.name}</span>
                    <span className="text-brand-600 font-bold">{item.score.toFixed(1)} / 100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Current Average: {item.score.toFixed(1)}</span>
                    <span>Institutional Target: {item.benchmark}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Export Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-navy-900 to-indigo-950 text-white shadow-md border border-navy-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-2 block">
                Official Institutional Data Export
              </span>
              <h3 className="text-xl font-bold text-white mb-2">
                Download Comprehensive Placement Audit Report
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Generates a clean CSV file including student registration numbers, departments, CGPA, assessment counts, latest readiness classifications, and multi-skill breakdowns.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 transition shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-slate-900" />
                <span>{isExporting ? 'Generating Report...' : 'Download CSV Now'}</span>
              </button>

              <Link
                to="/admin/students"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition"
              >
                <span>Browse Student List</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};
