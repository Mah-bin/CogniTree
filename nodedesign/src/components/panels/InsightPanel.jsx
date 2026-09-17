import React from 'react';
import {
  CheckCircle,
  Circle,
  Lock,
  AlertTriangle,
  Clock,
  RotateCcw,
  BookOpen,
  Layers,
  Sparkles,
  MousePointerClick,
  X,
} from 'lucide-react';

function formatTime(seconds) {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

const statusBadgeStyles = {
  mastered: {
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
    label: 'Mastered',
  },
  learning: {
    bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    icon: <Circle className="w-3.5 h-3.5 text-sky-500" />,
    label: 'In Progress',
  },
  current: {
    bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    icon: <Circle className="w-3.5 h-3.5 text-sky-500" />,
    label: 'Current Target',
  },
  struggling: {
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    label: 'Needs Review',
  },
  gap: {
    bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
    label: 'Knowledge Gap',
  },
  locked: {
    bg: 'bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700/50',
    icon: <Lock className="w-3.5 h-3.5 text-slate-400" />,
    label: 'Locked',
  },
};

export default function InsightPanel({ selectedNode, allNodes = [], onClose, theme = 'dark', onStartQuiz }) {
  const isLight = theme === 'light';

  if (!selectedNode) {
    return (
      <aside
        className={`w-[340px] shrink-0 h-full border-l p-6 flex flex-col items-center justify-center text-center select-none backdrop-blur-md transition-colors duration-300 ${
          isLight
            ? 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
            : 'bg-slate-900/60 border-slate-800/80 text-slate-100'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full border flex items-center justify-center mb-4 text-slate-400 shadow-inner ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/80 border-slate-700/60'
          }`}
        >
          <MousePointerClick className="w-6 h-6 text-slate-400 animate-bounce" />
        </div>
        <h3 className={`font-semibold text-base mb-1 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
          Concept Insights
        </h3>
        <p className={`text-sm max-w-[220px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Select a node to view details.
        </p>
      </aside>
    );
  }

  const {
    title,
    desc,
    status,
    mastery = 0,
    attempts = 0,
    timeSpent = 0,
    difficulty,
    prerequisites = [],
  } = selectedNode;
  const statusInfo = statusBadgeStyles[status] || statusBadgeStyles.locked;
  const isLocked = status === 'locked';

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const prereqNodes = prerequisites.map((id) => nodeMap.get(id)).filter(Boolean);

  return (
    <aside
      className={`w-[340px] shrink-0 h-full border-l p-5 flex flex-col justify-between overflow-y-auto select-none backdrop-blur-md transition-colors duration-300 ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-slate-900/60 border-slate-800/80 text-slate-100'
      }`}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className={`flex items-start justify-between gap-2 border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.bg}`}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
              {difficulty && (
                <span
                  className={`capitalize text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-800 text-slate-300 border-slate-700/50'
                  }`}
                >
                  {difficulty}
                </span>
              )}
            </div>
            <h2 className={`text-lg font-bold leading-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {title}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Description */}
        {desc && (
          <div
            className={`text-xs leading-relaxed p-3 rounded-lg border ${
              isLight
                ? 'bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-slate-950/40 text-slate-300 border-slate-800/60'
            }`}
          >
            {desc}
          </div>
        )}

        {onStartQuiz && (
          <button
            type="button"
            onClick={onStartQuiz}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
              isLight
                ? 'border-sky-300 bg-sky-100 text-sky-700 hover:bg-sky-200'
                : 'border-sky-500/40 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Attend Quiz
          </button>
        )}

        {/* Mastery Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Mastery Level
            </span>
            <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{mastery}%</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800/80'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLocked ? 'bg-slate-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`border p-3 rounded-xl flex flex-col ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-950/50 border-slate-800/60'
            }`}
          >
            <span className={`text-[11px] font-medium flex items-center gap-1 mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <RotateCcw className="w-3 h-3 text-slate-400" />
              Total Attempts
            </span>
            <span className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{attempts}</span>
          </div>
          <div
            className={`border p-3 rounded-xl flex flex-col ${
              isLight
                ? 'bg-slate-50 border-slate-200'
                : 'bg-slate-950/50 border-slate-800/60'
            }`}
          >
            <span className={`text-[11px] font-medium flex items-center gap-1 mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <Clock className="w-3 h-3 text-slate-400" />
              Time Spent
            </span>
            <span className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {formatTime(timeSpent)}
            </span>
          </div>
        </div>

        {/* Prerequisites List */}
        <div className="space-y-2.5 pt-2">
          <h3 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            Prerequisites ({prereqNodes.length})
          </h3>
          {prereqNodes.length === 0 ? (
            <div
              className={`text-xs italic p-2.5 rounded-lg border ${
                isLight
                  ? 'bg-slate-50 text-slate-500 border-slate-200'
                  : 'bg-slate-950/30 text-slate-400 border-slate-800/40'
              }`}
            >
              None (Root Concept)
            </div>
          ) : (
            <div className="space-y-1.5">
              {prereqNodes.map((prereq) => (
                <div
                  key={prereq.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-950/40 border-slate-800/60'
                  }`}
                >
                  <span className={`font-medium truncate pr-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {prereq.title}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 capitalize ${
                      isLight
                        ? 'bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 text-slate-400 border-slate-700/40'
                    }`}
                  >
                    {prereq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div
        className={`pt-4 border-t text-center text-[11px] flex items-center justify-between ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-400'
        }`}
      >
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          CogniTree LMS
        </span>
        <span>ID: {selectedNode.id}</span>
      </div>
    </aside>
  );
}
