import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  GitPullRequest,
  X,
} from 'lucide-react';

export default function DiagnosticPanel({ onResetScan, onStartDetour }) {
  return (
    <aside className="w-[340px] shrink-0 h-full bg-slate-900/95 backdrop-blur-xl border-l border-red-500/40 p-5 text-slate-100 flex flex-col justify-between overflow-y-auto select-none shadow-2xl shadow-red-950/80 transition-all duration-300">
      <div className="space-y-5">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-xs font-bold text-red-400 tracking-wide uppercase">
              Diagnostic Result
            </span>
          </div>
          {onResetScan && (
            <button
              onClick={onResetScan}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Headline Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-red-400 font-extrabold text-xs tracking-wider">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            FOUNDATIONAL GAP DETECTED
          </div>
          <h2 className="text-base font-bold text-slate-100">
            Likely issue: <span className="text-red-400">Fraction Operations</span>
          </h2>
          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
            Cognitive analysis detected a root prerequisite block affecting higher-level mastery.
          </p>
        </div>

        {/* Evidence Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <GitPullRequest className="w-3.5 h-3.5 text-red-400" />
            Evidence Breakdown
          </h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-200">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>6 failed attempts</span>
            </li>
            <li className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>High time-to-mastery</span>
            </li>
            <li className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-200">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Failed prerequisite dependency</span>
            </li>
          </ul>
        </div>

        {/* Recommended Action Summary */}
        <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Recommended Plan
          </span>
          <p className="text-xs text-slate-300 leading-normal">
            Complete a targeted 5-minute refresher on Fraction Operations before proceeding to Quadratic Functions.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4 border-t border-slate-800/80">
        <button
          onClick={onStartDetour}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>Start Detour</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        {onResetScan && (
          <button
            onClick={onResetScan}
            className="w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 font-medium text-xs border border-slate-700/50 transition-colors"
          >
            Dismiss Analysis
          </button>
        )}
      </div>
    </aside>
  );
}
