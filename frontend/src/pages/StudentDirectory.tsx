import React, { useEffect, useState } from 'react';
import {
  Users, Search, Download, Filter, Eye, Building2,
  Calendar, CheckCircle2, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { StudentDetailModal } from './StudentDetailModal';
import { adminAPI } from '../services/api';
import { StudentListItem, StudentDetail } from '../types';

export const StudentDirectory: React.FC = () => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getStudents({
        query: searchQuery || undefined,
        department: selectedDept || undefined,
        readiness_category: selectedCategory || undefined,
      });
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students directory', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedDept, selectedCategory]);

  const handleOpenDetail = async (id: number) => {
    try {
      const detail = await adminAPI.getStudentDetail(id);
      setSelectedStudent(detail);
    } catch (err) {
      console.error('Failed to load student detail', err);
    }
  };

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

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Data Science & AI',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  return (
    <Sidebar>
      <div className="py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Student Directory & Oversight
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Search, filter, and inspect student placement profiles and machine learning evaluation outcomes.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition self-start sm:self-auto disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating CSV...' : 'Download CSV Report'}</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or PRN..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition bg-white text-slate-700"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Readiness Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition bg-white text-slate-700"
            >
              <option value="">All Readiness Categories</option>
              <option value="Placement Ready">Placement Ready</option>
              <option value="Developing">Developing</option>
              <option value="Needs Preparation">Needs Preparation</option>
              <option value="Unassessed">Unassessed</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        {isLoading ? (
          <LoadingSpinner message="Searching student records..." />
        ) : students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Students Found"
            description="No student records match your query or filter criteria. Clear filters to see all students."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3.5">Student Details</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">CGPA</th>
                    <th className="px-5 py-3.5">Assessments</th>
                    <th className="px-5 py-3.5">Readiness Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700">
                            {st.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{st.full_name}</p>
                            <p className="text-[11px] text-slate-400">
                              {st.email} • {st.reg_number || 'No PRN'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-600">
                        {st.department || 'General Engineering'}
                      </td>

                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        {st.cgpa ? st.cgpa.toFixed(2) : 'N/A'}
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-slate-600">
                        {st.assessments_count} run(s)
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge category={st.latest_readiness_category} size="sm" />
                          {st.latest_readiness_score !== null && st.latest_readiness_score !== undefined && (
                            <span className="text-[11px] font-bold text-slate-700">
                              ({st.latest_readiness_score.toFixed(0)}%)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenDetail(st.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200/50 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Student Detail */}
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      </div>
    </Sidebar>
  );
};
