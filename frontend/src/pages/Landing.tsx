import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, ArrowRight, Brain, Target, CheckCircle2, TrendingUp,
  Award, Shield, FileText, Sparkles, BarChart, Users
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/60 via-indigo-50/40 to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI-Driven Campus Placement Readiness Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15]">
            Your Journey to Placement <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-indigo-600 to-brand-500">
              Starts With Precision Data.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            PlacePilot combines authentic machine-learning classification, personalized skill gap diagnostics, and institutional tracking to help every student prepare with confidence.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/25 transition hover:scale-[1.02]"
            >
              <span>Begin Free Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition"
            >
              <span>Sign In with Demo Account</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-left">
            <div className="p-3">
              <p className="text-xs font-medium text-slate-500">ML Classification</p>
              <p className="text-xl font-bold text-slate-900">Random Forest</p>
              <p className="text-[11px] text-mint-600 font-medium">85%+ Test Accuracy</p>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-slate-500">Skill Dimensions</p>
              <p className="text-xl font-bold text-slate-900">10 Core Metrics</p>
              <p className="text-[11px] text-brand-600 font-medium">Holistic Evaluation</p>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-slate-500">Action Engine</p>
              <p className="text-xl font-bold text-slate-900">Data-Driven</p>
              <p className="text-[11px] text-indigo-600 font-medium">Targeted Roadmaps</p>
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-slate-500">Institutional</p>
              <p className="text-xl font-bold text-slate-900">Faculty Suite</p>
              <p className="text-[11px] text-slate-600 font-medium">Real-time Analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-16 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">
              Comprehensive Platform Capabilities
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed For Real Student Success & Institutional Review
            </p>
            <p className="mt-4 text-slate-600">
              Unlike static checklists, PlacePilot computes dynamic machine learning outcomes paired with verifiable preparation history.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-200 transition group hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 mb-5 group-hover:scale-110 transition">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Scikit-Learn ML Inference
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Trained on standardized multi-dimensional student performance metrics. Outputs calibrated readiness categories (Placement Ready, Developing, Needs Preparation) with probabilistic confidence scores.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-200 transition group hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 mb-5 group-hover:scale-110 transition">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Gap Diagnostics & Roadmaps
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pinpoints concrete weaknesses across Coding, Aptitude, Core Technical concepts, or Resume structure. Generates prioritized actionable tasks students can mark complete over time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-200 transition group hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-mint-700 mb-5 group-hover:scale-110 transition">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Faculty Governance & Export
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Departmental breakdown of student readiness, aggregated skill averages, high-priority support queues, and complete institutional CSV exports for placement coordinators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ML Pipeline Explanation */}
      <section id="ml-pipeline" className="py-16 bg-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2 block">
              Ethical AI Architecture
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Genuine Machine Learning Pipeline
            </h2>
            <p className="mt-3 text-slate-400">
              No fake percentage math or hardcoded numbers. The prediction engine uses reproducible Scikit-Learn models persisted with Joblib.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-navy-900/80 border border-navy-800">
              <span className="text-2xl font-black text-brand-400 mb-2 block">01</span>
              <h4 className="font-bold text-base text-white mb-1">Feature Extraction</h4>
              <p className="text-xs text-slate-400">
                10 educational features including CGPA, coding fluency, aptitude, communication, projects, and active backlogs.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-navy-900/80 border border-navy-800">
              <span className="text-2xl font-black text-indigo-400 mb-2 block">02</span>
              <h4 className="font-bold text-base text-white mb-1">Standard Scaling</h4>
              <p className="text-xs text-slate-400">
                Features standardized through a fitted pipeline to prevent data leakage and handle varied continuous score distributions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-navy-900/80 border border-navy-800">
              <span className="text-2xl font-black text-brand-400 mb-2 block">03</span>
              <h4 className="font-bold text-base text-white mb-1">Random Forest</h4>
              <p className="text-xs text-slate-400">
                Ensemble of 150 decision trees evaluating non-linear feature interactions with calibrated class probability estimates.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-navy-900/80 border border-navy-800">
              <span className="text-2xl font-black text-mint-400 mb-2 block">04</span>
              <h4 className="font-bold text-base text-white mb-1">Actionable Output</h4>
              <p className="text-xs text-slate-400">
                Translates probabilistic scores into intuitive categories alongside clear disclaimers and prescriptive recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Comparison */}
      <section id="role-comparison" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Two Dedicated Portals
            </h2>
            <p className="mt-3 text-slate-600">
              Role-based authorization guarantees students private personal preparation while giving faculty institutional intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Student Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    Student Portal
                  </span>
                  <Compass className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Placement Readiness Hub</h3>
                <ul className="space-y-3 text-sm text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Multi-step assessment wizard with real-time validation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Instant ML prediction & skill distribution radar charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Personalized preparation task manager with progress tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>Historical trend comparison across multiple attempts</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 transition"
              >
                <span>Register as Student</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Faculty Card */}
            <div className="p-8 rounded-3xl bg-navy-900 text-white border border-navy-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-navy-800 text-mint-400 border border-navy-700">
                    Faculty & Admin Portal
                  </span>
                  <Shield className="w-6 h-6 text-mint-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Institutional Intelligence</h3>
                <ul className="space-y-3 text-sm text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Aggregate placement readiness distribution analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Department-wise performance benchmarks and comparative charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>Filterable student directory with instant drill-down profiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-400 shrink-0" />
                    <span>One-click CSV data export for institutional reports</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-slate-900 bg-white hover:bg-slate-100 transition"
              >
                <span>Faculty Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-800">PlacePilot</span>
            <span>— AI-Powered Campus Placement System</span>
          </div>
          <p>© 2026 PlacePilot. Designed for college project demonstrations & institutional readiness evaluation.</p>
        </div>
      </footer>
    </div>
  );
};
