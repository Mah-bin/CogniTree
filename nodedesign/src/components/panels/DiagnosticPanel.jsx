import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  GitPullRequest,
  X,
} from 'lucide-react';

export default function DiagnosticPanel({ onResetScan, onStartDetour, diagnosis, allNodes, theme = 'dark' }) {
  const isLight = theme === 'light';

  // Defensive fallbacks in case it opens before diagnosis is ready
  const gapNodeId = diagnosis?.gapNode;
  const failedNodeId = diagnosis?.failedNode;
  
  const gapNode = allNodes?.find(n => n.id === gapNodeId) || { title: 'Unknown Topic' };
  const failedNode = allNodes?.find(n => n.id === failedNodeId) || { title: 'Unknown Topic' };

  return (
    <aside
      className={`w-[340px] shrink-0 h-full border-l p-5 flex flex-col justify-between overflow-y-auto select-none backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        isLight
          ? 'bg-white/95 border-red-400/50 text-slate-900 shadow-red-500/10'
          : 'bg-slate-900/95 border-red-500/40 text-slate-100 shadow-red-950/80'
      }`}
    >
      <div className="space-y-5">
        {/* Top Header Badge */}
        <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 tracking-wide uppercase">
              Diagnostic Result
            </span>
          </div>
          {onResetScan && (
            <button
              onClick={onResetScan}
              className={`p-1 rounded-lg transition-colors ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Headline Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-extrabold text-xs tracking-wider">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            FOUNDATIONAL GAP DETECTED
          </div>
          <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            Likely issue: <span className="text-red-600 dark:text-red-400">{gapNode.title}</span>
          </h2>
          <p className={`text-[11px] leading-relaxed pt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            Cognitive analysis detected a root prerequisite block affecting higher-level mastery.
          </p>
        </div>

        {/* Evidence Breakdown */}
        <div className="space-y-3">
          <h3 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <GitPullRequest className="w-3.5 h-3.5 text-red-500" />
            Evidence Breakdown
          </h3>
          <ul className="space-y-2 text-xs">
            <li
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-slate-800/60 text-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Failed on {failedNode.title}</span>
            </li>
            <li
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-slate-800/60 text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="line-clamp-2">{diagnosis?.reason || 'Failed prerequisite dependency'}</span>
            </li>
          </ul>
        </div>

        {/* Recommended Action Summary */}
        <div
          className={`border p-3.5 rounded-xl space-y-1 ${
            isLight ? 'bg-amber-50/50 border-amber-200/80' : 'bg-slate-950/50 border-slate-800/80'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Recommended Plan
          </span>
          <p className={`text-xs leading-normal ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Complete a targeted 5-minute refresher on {gapNode.title} before proceeding to {failedNode.title}.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`space-y-2 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
        <button
          onClick={onStartDetour}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start Detour</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        {onResetScan && (
          <button
            onClick={onResetScan}
            className={`w-full py-2 px-4 rounded-xl border font-medium text-xs transition-colors cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border-slate-700/50'
            }`}
          >
            Dismiss Analysis
          </button>
        )}
      </div>
    </aside>
  );
}