import React from 'react';
import { Activity, Loader2, GitPullRequest, AlertOctagon, RotateCcw, User, Award, Brain } from 'lucide-react';

export default function TopBar({
  studentName = 'Alex Rivera',
  overallMastery = 72,
  stage,
  onRunScan,
  onResetScan,
}) {
  const isScanning = stage !== 'idle' && stage !== 'recommendation';

  return (
    <header className="absolute top-0 left-0 right-0 z-20 h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-5 flex items-center justify-between select-none">
      {/* Left: Branding */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
          <Brain className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
          🌳 CogniTree
        </span>
      </div>

      {/* Center: Student Name & Overall Mastery */}
      <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800/80 px-4 py-1 rounded-full text-xs">
        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{studentName}</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400 font-medium">Overall Mastery:</span>
          <span className="font-bold text-emerald-400">{overallMastery}%</span>
        </div>
      </div>

      {/* Right: Scan Controls & Indicators */}
      <div className="flex items-center gap-2.5">
        {stage === 'scanning' && (
          <span className="flex items-center gap-2 text-xs font-semibold text-amber-400 pr-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Scanning...
          </span>
        )}
        {stage === 'path-revealing' && (
          <span className="flex items-center gap-2 text-xs font-semibold text-sky-400 pr-1">
            <GitPullRequest className="w-3.5 h-3.5 animate-pulse" />
            Tracing Dependencies...
          </span>
        )}
        {stage === 'gap-found' && (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-400 pr-1">
            <AlertOctagon className="w-3.5 h-3.5 animate-bounce" />
            Gap Found!
          </span>
        )}

        <button
          onClick={onRunScan}
          disabled={isScanning}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
            isScanning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
          }`}
        >
          <Activity className={`w-3.5 h-3.5 ${isScanning ? 'animate-pulse' : ''}`} />
          <span>Run Cognitive Scan</span>
        </button>

        {stage === 'recommendation' && (
          <button
            onClick={onResetScan}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Reset scan state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
}
