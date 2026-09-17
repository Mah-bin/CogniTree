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
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
    label: 'Mastered',
  },
  learning: {
    bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    icon: <Circle className="w-3.5 h-3.5 text-sky-400" />,
    label: 'In Progress',
  },
  current: {
    bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    icon: <Circle className="w-3.5 h-3.5 text-sky-400" />,
    label: 'Current Target',
  },
  struggling: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
    label: 'Needs Review',
  },
  gap: {
    bg: 'bg-red-500/10 text-red-400 border-red-500/30',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
    label: 'Knowledge Gap',
  },
  locked: {
    bg: 'bg-slate-800/80 text-slate-400 border-slate-700/50',
    icon: <Lock className="w-3.5 h-3.5 text-slate-400" />,
    label: 'Locked',
  },
};

export default function InsightPanel({ selectedNode, allNodes = [], onClose }) {
  if (!selectedNode) {
    return (
      <aside className="w-[340px] shrink-0 h-full bg-slate-900/60 backdrop-blur-md border-l border-slate-800/80 p-6 text-slate-100 flex flex-col items-center justify-center text-center select-none">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
          <MousePointerClick className="w-6 h-6 text-slate-400 animate-bounce" />
        </div>
        <h3 className="font-semibold text-slate-200 text-base mb-1">Concept Insights</h3>
        <p className="text-slate-400 text-sm max-w-[220px]">
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

  // Map prerequisite IDs to titles
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const prereqNodes = prerequisites.map((id) => nodeMap.get(id)).filter(Boolean);

  return (
    <aside className="w-[340px] shrink-0 h-full bg-slate-900/60 backdrop-blur-md border-l border-slate-800/80 p-5 text-slate-100 flex flex-col justify-between overflow-y-auto select-none">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.bg}`}
              >
                {statusInfo.icon}
                {statusInfo.label}
              </span>
              {difficulty && (
                <span className="capitalize text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700/50">
                  {difficulty}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-100 leading-tight">{title}</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Description */}
        {desc && (
          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
            {desc}
          </div>
        )}

        {/* Mastery Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Mastery Level
            </span>
            <span className="text-slate-200 font-bold">{mastery}%</span>
          </div>
          <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLocked ? 'bg-slate-700' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
              <RotateCcw className="w-3 h-3 text-slate-500" />
              Total Attempts
            </span>
            <span className="text-base font-bold text-slate-100">{attempts}</span>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/60 p-3 rounded-xl flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Time Spent
            </span>
            <span className="text-base font-bold text-slate-100">{formatTime(timeSpent)}</span>
          </div>
        </div>

        {/* Prerequisites List */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            Prerequisites ({prereqNodes.length})
          </h3>
          {prereqNodes.length === 0 ? (
            <div className="text-xs text-slate-400 italic bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/40">
              None (Root Concept)
            </div>
          ) : (
            <div className="space-y-1.5">
              {prereqNodes.map((prereq) => (
                <div
                  key={prereq.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs"
                >
                  <span className="font-medium text-slate-200 truncate pr-2">{prereq.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/40 shrink-0 capitalize">
                    {prereq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-slate-800/60 text-center text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          CogniTree LMS
        </span>
        <span>ID: {selectedNode.id}</span>
      </div>
    </aside>
  );
}
