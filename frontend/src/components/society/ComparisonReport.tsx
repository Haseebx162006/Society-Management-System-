"use client";

import { X, AlertTriangle, CheckCircle2, BarChart3, Lightbulb, Shield, Loader2 } from "lucide-react";

interface OverlappingSociety {
  societyName: string;
  similarityScore: number;
  overlappingObjectives: string[];
  overlappingActivities: string[];
  uniqueAspects: string[];
}

interface ComparisonData {
  requestName: string;
  overallSimilarityScore: number;
  summary: string;
  overlappingSocieties: OverlappingSociety[];
  recommendation: string;
  uniqueValueProposition: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-red-100 text-red-700 border-red-200"
      : score >= 40
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${color}`}>
      {score}% overlap
    </span>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const normalized = recommendation.toUpperCase();
  if (normalized.includes("APPROVE")) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl">
        <CheckCircle2 className="w-5 h-5 shrink-0" />
        <span className="text-sm font-bold">{recommendation}</span>
      </div>
    );
  }
  if (normalized.includes("DUPLICATE")) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-bold">{recommendation}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">
      <Shield className="w-5 h-5 shrink-0" />
      <span className="text-sm font-bold">{recommendation}</span>
    </div>
  );
}

export default function ComparisonReport({
  data,
  isLoading,
  error,
  onClose,
}: {
  data?: ComparisonData;
  isLoading: boolean;
  error?: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-stone-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 py-5 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">Comparison Report</h2>
              <p className="text-xs text-stone-500">AI-powered analysis against existing societies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-stone-800">Generating Comparison Report</p>
                <p className="text-xs text-stone-500 mt-1">Analyzing objectives and activities against existing societies...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertTriangle className="w-10 h-10 text-red-400" />
              <p className="text-sm font-bold text-red-700">Failed to generate comparison report</p>
              <p className="text-xs text-stone-500">
                {(error as any)?.data?.message || "An unexpected error occurred. Please try again."}
              </p>
            </div>
          )}

          {data && !isLoading && (
            <>
              {/* Overall Score + Summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base font-black text-stone-900">{data.requestName}</h3>
                  <ScoreBadge score={data.overallSimilarityScore} />
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{data.summary}</p>
              </div>

              {/* Recommendation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">AI Recommendation</h4>
                <RecommendationBadge recommendation={data.recommendation} />
              </div>

              {/* Unique Value Proposition */}
              {data.uniqueValueProposition && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Unique Value</h4>
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-900 leading-relaxed">{data.uniqueValueProposition}</p>
                  </div>
                </div>
              )}

              {/* Overlapping Societies */}
              {data.overlappingSocieties.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                    Overlapping Societies ({data.overlappingSocieties.length})
                  </h4>
                  <div className="space-y-3">
                    {data.overlappingSocieties.map((s, idx) => (
                      <div key={idx} className="border border-stone-200 rounded-2xl overflow-hidden">
                        <div className="bg-stone-50 px-5 py-3 flex items-center justify-between border-b border-stone-100">
                          <h5 className="text-sm font-bold text-stone-900">{s.societyName}</h5>
                          <ScoreBadge score={s.similarityScore} />
                        </div>
                        <div className="p-5 space-y-4">
                          {s.overlappingObjectives.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                                Overlapping Objectives
                              </p>
                              <ul className="space-y-1.5">
                                {s.overlappingObjectives.map((o, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                                    {o}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {s.overlappingActivities.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                                Overlapping Activities
                              </p>
                              <ul className="space-y-1.5">
                                {s.overlappingActivities.map((a, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                                    {a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {s.uniqueAspects.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
                                Differentiating Aspects
                              </p>
                              <ul className="space-y-1.5">
                                {s.uniqueAspects.map((u, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                                    {u}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.overlappingSocieties.length === 0 && (
                <div className="text-center py-8 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-emerald-800">No Significant Overlaps Found</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    This society appears to have a unique focus compared to existing societies.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 px-6 py-4 flex justify-end rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
