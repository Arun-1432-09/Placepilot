import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Brain,
  Award, Code2, Compass, ShieldAlert, CheckSquare, RefreshCw
} from 'lucide-react';
import { Sidebar } from '../components/common/Sidebar';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { predictionsAPI, assessmentsAPI } from '../services/api';
import { Prediction, Assessment, Recommendation } from '../types';

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if result is cached in sessionStorage from the recent submission
    const cached = sessionStorage.getItem('placepilot_latest_result');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setAssessment(parsed.assessment);
        setPrediction(parsed.prediction);
        setRecommendations(parsed.recommendations || []);
        setIsLoading(false);
        return;
      } catch (e) {
        // Fallback to fetch from API
      }
    }

    // Fetch latest from API
    predictionsAPI.getLatest()
      .then((pred) => {
        setPrediction(pred);
        return assessmentsAPI.getDetail(pred.assessment_id);
      })
      .then((assess) => {
        setAssessment(assess);
        setRecommendations(assess.recommendations || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Sidebar>
        <LoadingSpinner message="Retrieving your latest ML prediction..." />
      </Sidebar>
    );
  }

  if (!prediction) {
    return (
      <Sidebar>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">No prediction outcome found.</p>
          <Link
            to="/assessment/new"
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
          >
            Take Assessment
          </Link>
        </div>
      </Sidebar>
    );
  }

  const isReady = prediction.readiness_category === 'Placement Ready';
  const isDeveloping = prediction.readiness_category === 'Developing';

  return (
    <Sidebar>
      <div className="max-w-4xl mx-auto py-4">
        {/* Banner Outcome Card */}
        <div
          className={`p-8 rounded-3xl text-white shadow-xl border relative overflow-hidden mb-8 ${
            isReady
              ? 'bg-gradient-to-br from-navy-950 via-slate-900 to-emerald-950 border-emerald-800/60'
              : isDeveloping
              ? 'bg-gradient-to-br from-navy-950 via-indigo-950 to-slate-900 border-indigo-800/60'
              : 'bg-gradient-to-br from-navy-950 via-slate-900 to-rose-950 border-rose-800/60'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Scikit-Learn Classification Outcome
                </span>
                <StatusBadge category={prediction.readiness_category} size="md" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                Placement Category: {prediction.readiness_category}
              </h1>

              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                {isReady
                  ? 'Your profile displays strong alignment with campus recruitment standards across core technical knowledge, coding fluency, and project exposure.'
                  : isDeveloping
                  ? 'Your evaluation shows solid potential with key actionable gaps. Implementing the targeted recommendations below will optimize your interview readiness.'
                  : 'Important gaps identified in foundational aptitude or technical rounds. Focused daily practice in algorithmic problem solving is recommended.'}
              </p>
            </div>

            {/* Score Ring */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md self-start md:self-center shrink-0">
              <span className="text-3xl font-black text-white">
                {prediction.readiness_score.toFixed(1)}%
              </span>
              <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider mt-1">
                Model Readiness Score
              </span>
            </div>
          </div>
        </div>

        {/* Probabilities Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-mint-700">Ready Probability</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {(prediction.probability_ready * 100).toFixed(1)}%
            </p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-mint-500 rounded-full"
                style={{ width: `${prediction.probability_ready * 100}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-indigo-700">Developing Probability</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {(prediction.probability_developing * 100).toFixed(1)}%
            </p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${prediction.probability_developing * 100}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-semibold text-rose-700">Needs Prep Probability</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {(prediction.probability_needs_prep * 100).toFixed(1)}%
            </p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${prediction.probability_needs_prep * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Strengths & Improvement Areas */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-bold text-mint-800 mb-4 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-mint-600" />
              <span>Identified Key Competencies</span>
            </div>
            <div className="space-y-2.5">
              {prediction.strongest_areas.map((area, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-mint-50/60 border border-mint-200 text-xs font-semibold text-mint-950 flex items-center justify-between"
                >
                  <span>{area}</span>
                  <span className="text-[10px] uppercase font-bold text-mint-700 bg-white px-2 py-0.5 rounded border border-mint-200">
                    Strong
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Gaps */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-4 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Targeted Focus Areas</span>
            </div>
            <div className="space-y-2.5">
              {prediction.improvement_areas.map((area, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs font-semibold text-amber-950 flex items-center justify-between"
                >
                  <span>{area}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                    Needs Polish
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generated Personalized Recommendations */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs mb-8">
          <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recommended Action Roadmap
              </h3>
              <p className="text-xs text-slate-500">
                Data-driven actions created specifically for this assessment run.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage in Task Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{rec.area}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      rec.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-slate-700 mb-1">{rec.action}</p>
                <p className="text-[11px] text-slate-400 italic">Diagnostic: {rec.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ethical AI & Institutional Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-600 text-xs flex items-start gap-3 mb-8">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Model Disclaimer:</strong> {prediction.disclaimer}
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            to="/assessment/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Assessment</span>
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition hover:shadow"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Sidebar>
  );
};
