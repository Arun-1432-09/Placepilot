import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle,
  Award, Code2, Brain, Briefcase, FileText, Check
} from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { assessmentsAPI, studentsAPI } from '../services/api';

export const NewAssessment: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State initialized with student's current profile values if available
  const [formData, setFormData] = useState({
    cgpa: 7.8,
    backlogs_count: 0,
    coding_score: 70,
    technical_score: 70,
    aptitude_score: 70,
    communication_score: 72,
    projects_count: 2,
    internships_count: 0,
    certifications_count: 1,
    resume_readiness: 75,
    interview_prep_level: 'Intermediate',
  });

  useEffect(() => {
    // Pre-populate with student's saved profile defaults
    studentsAPI.getProfile().then((p) => {
      if (p) {
        setFormData({
          cgpa: p.cgpa || 7.8,
          backlogs_count: p.backlogs_count || 0,
          coding_score: p.coding_score || 70,
          technical_score: p.technical_score || 70,
          aptitude_score: p.aptitude_score || 70,
          communication_score: p.communication_score || 72,
          projects_count: p.projects_count || 2,
          internships_count: p.internships_count || 0,
          certifications_count: p.certifications_count || 1,
          resume_readiness: p.resume_readiness || 75,
          interview_prep_level: p.interview_prep_level || 'Intermediate',
        });
      }
    }).catch(() => {
      // Use defaults if network fails
    });
  }, []);

  const steps = [
    { id: 1, title: 'Academic Performance', icon: Award },
    { id: 2, title: 'Technical & Coding', icon: Code2 },
    { id: 3, title: 'Aptitude & Verbal', icon: Brain },
    { id: 4, title: 'Projects & Experience', icon: Briefcase },
    { id: 5, title: 'Resume & Review', icon: FileText },
  ];

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError(null);
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await assessmentsAPI.submitAssessment({
        cgpa: Number(formData.cgpa),
        aptitude_score: Number(formData.aptitude_score),
        technical_score: Number(formData.technical_score),
        communication_score: Number(formData.communication_score),
        coding_score: Number(formData.coding_score),
        projects_count: Number(formData.projects_count),
        internships_count: Number(formData.internships_count),
        certifications_count: Number(formData.certifications_count),
        backlogs_count: Number(formData.backlogs_count),
        resume_readiness: Number(formData.resume_readiness),
        interview_prep_level: formData.interview_prep_level,
      });

      // Save the latest result in sessionStorage for instant viewing in Results page
      sessionStorage.setItem('placepilot_latest_result', JSON.stringify(response));
      navigate('/results');
    } catch (err: any) {
      console.error('Assessment submission error', err);
      setError(
        err.response?.data?.detail || 'Failed to submit assessment and run prediction model. Please check values.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-3xl mx-auto py-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Placement Readiness Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Placement Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
            Complete the 5 sections below. The Scikit-Learn prediction model will compute your placement readiness probability and diagnosis.
          </p>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                        isDone
                          ? 'bg-mint-500 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-4 ring-brand-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                        isCurrent ? 'text-brand-600' : isDone ? 'text-mint-700' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition ${
                        step.id < currentStep ? 'bg-mint-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content Cards per Step */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs mb-8">
          {/* STEP 1: Academic Performance */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Academic Standing</h3>
                <p className="text-xs text-slate-500">
                  Institutional academic indicators evaluated by campus recruiters.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Current Cumulative CGPA</span>
                  <span className="text-brand-600 font-bold">{formData.cgpa} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="10.0"
                  step="0.05"
                  value={formData.cgpa}
                  onChange={(e) => updateField('cgpa', parseFloat(e.target.value))}
                  className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5.0 (Passing)</span>
                  <span>7.5 (Standard Benchmark)</span>
                  <span>10.0 (Perfect)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Active Backlogs / Arrears Count
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => updateField('backlogs_count', count)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        formData.backlogs_count === count
                          ? count === 0
                            ? 'bg-mint-50 border-mint-500 text-mint-700 shadow-2xs'
                            : 'bg-rose-50 border-rose-500 text-rose-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {count === 3 ? '3+ Backlogs' : `${count} Backlog${count === 1 ? '' : 's'}`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Top tier recruiting companies typically mandate 0 active backlogs during drive registrations.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Technical & Coding Skills */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Technical & Problem Solving Proficiency</h3>
                <p className="text-xs text-slate-500">
                  Assess your technical coding skills and computer science fundamentals.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Coding & Algorithmic Fluency (DSA, Problem Solving)</span>
                  <span className="text-indigo-600 font-bold">{formData.coding_score} / 100</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={formData.coding_score}
                  onChange={(e) => updateField('coding_score', parseInt(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>20 (Basic syntax)</span>
                  <span>60 (Arrays & Strings)</span>
                  <span>100 (Dynamic Prog & Trees)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Core Technical Knowledge (DBMS, OS, Networks, OOP)</span>
                  <span className="text-brand-600 font-bold">{formData.technical_score} / 100</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={formData.technical_score}
                  onChange={(e) => updateField('technical_score', parseInt(e.target.value))}
                  className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>20 (Introductory)</span>
                  <span>65 (Core concepts clear)</span>
                  <span>100 (Advanced system design)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Aptitude & Communication */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Aptitude & Communication</h3>
                <p className="text-xs text-slate-500">
                  Round 1 online assessments test quantitative aptitude and verbal reasoning.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Quantitative & Logical Aptitude</span>
                  <span className="text-emerald-600 font-bold">{formData.aptitude_score} / 100</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="100"
                  step="1"
                  value={formData.aptitude_score}
                  onChange={(e) => updateField('aptitude_score', parseInt(e.target.value))}
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>25 (Needs practice)</span>
                  <span>70 (Speed & accuracy)</span>
                  <span>100 (Competitive test ready)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Communication & Behavioral Presentation</span>
                  <span className="text-brand-600 font-bold">{formData.communication_score} / 100</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="1"
                  value={formData.communication_score}
                  onChange={(e) => updateField('communication_score', parseInt(e.target.value))}
                  className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>30 (Hesitant)</span>
                  <span>70 (Clear articulation)</span>
                  <span>100 (Fluent executive presence)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Projects & Experience */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Practical Portfolio & Experience</h3>
                <p className="text-xs text-slate-500">
                  Real projects and internships validate hands-on industry capability.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Substantial Projects Completed (Deployable / GitHub)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => updateField('projects_count', count)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        formData.projects_count === count
                          ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {count === 4 ? '4+' : count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Internships Completed (Company or Research)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => updateField('internships_count', count)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        formData.internships_count === count
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {count === 3 ? '3+' : count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Relevant Certifications (Cloud, Security, Web, AI)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => updateField('certifications_count', count)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        formData.certifications_count === count
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {count === 4 ? '4+' : count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Resume & Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Resume & Interview Polish Review</h3>
                <p className="text-xs text-slate-500">
                  Verify your input before executing the machine-learning placement prediction model.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Resume Readiness (Self-evaluated 0-100)</span>
                  <span className="text-brand-600 font-bold">{formData.resume_readiness} / 100</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="1"
                  value={formData.resume_readiness}
                  onChange={(e) => updateField('resume_readiness', parseInt(e.target.value))}
                  className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mock Interview Preparation Stage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => updateField('interview_prep_level', lvl)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        formData.interview_prep_level === lvl
                          ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Summary Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Summary of Submitted Assessment Features:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div><span className="text-slate-400">CGPA:</span> <strong className="text-slate-800">{formData.cgpa}</strong></div>
                  <div><span className="text-slate-400">Coding:</span> <strong className="text-slate-800">{formData.coding_score}/100</strong></div>
                  <div><span className="text-slate-400">Technical:</span> <strong className="text-slate-800">{formData.technical_score}/100</strong></div>
                  <div><span className="text-slate-400">Aptitude:</span> <strong className="text-slate-800">{formData.aptitude_score}/100</strong></div>
                  <div><span className="text-slate-400">Communication:</span> <strong className="text-slate-800">{formData.communication_score}/100</strong></div>
                  <div><span className="text-slate-400">Projects:</span> <strong className="text-slate-800">{formData.projects_count}</strong></div>
                  <div><span className="text-slate-400">Internships:</span> <strong className="text-slate-800">{formData.internships_count}</strong></div>
                  <div><span className="text-slate-400">Backlogs:</span> <strong className="text-slate-800">{formData.backlogs_count}</strong></div>
                  <div><span className="text-slate-400">Resume:</span> <strong className="text-slate-800">{formData.resume_readiness}/100</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition hover:shadow"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 transition hover:scale-[1.02] disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Computing Prediction Model...' : 'Submit & Run ML Prediction'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};
