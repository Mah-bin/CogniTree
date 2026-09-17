import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle, Circle, Lock, AlertTriangle, Clock, RotateCcw, AlertOctagon } from 'lucide-react';

function formatTime(seconds) {
  if (!seconds) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

const statusStyles = {
  mastered: {
    card: 'border-emerald-500/80 shadow-lg shadow-emerald-500/20 bg-slate-900/90',
    handle: '!bg-emerald-500',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
    bar: 'bg-emerald-500',
  },
  learning: {
    card: 'border-sky-400/90 shadow-lg shadow-sky-400/30 animate-pulse bg-slate-900/95 ring-1 ring-sky-400/30',
    handle: '!bg-sky-400',
    icon: <Circle className="w-4 h-4 text-sky-400 shrink-0" />,
    bar: 'bg-sky-400',
  },
  current: {
    card: 'border-sky-400/90 shadow-lg shadow-sky-400/30 animate-pulse bg-slate-900/95 ring-1 ring-sky-400/30',
    handle: '!bg-sky-400',
    icon: <Circle className="w-4 h-4 text-sky-400 shrink-0" />,
    bar: 'bg-sky-400',
  },
  struggling: {
    card: 'border-amber-500/80 shadow-lg shadow-amber-500/20 animate-pulse bg-slate-900/90',
    handle: '!bg-amber-500',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    bar: 'bg-amber-500',
  },
  gap: {
    card: 'border-red-500/90 shadow-xl shadow-red-500/40 animate-pulse bg-slate-900/90',
    handle: '!bg-red-500',
    icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
    bar: 'bg-red-500',
  },
  locked: {
    card: 'border-slate-700/60 opacity-50 shadow-none bg-slate-950/60',
    handle: '!bg-slate-700',
    icon: <Lock className="w-4 h-4 text-slate-500 shrink-0" />,
    bar: 'bg-slate-700',
  },
};

export default function ConceptNode({ data }) {
  const {
    title = 'Concept',
    mastery = 0,
    attempts = 0,
    timeSpent = 0,
    status = 'locked',
    isScanningTarget,
    isGapFoundNode,
    isOnPath,
    isDimmed,
  } = data || {};

  const defaultStyle = statusStyles[status] || statusStyles.locked;
  const isLocked = status === 'locked' && !isGapFoundNode;

  // Determine card style based on diagnostic scan state
  let dynamicCardStyle = defaultStyle.card;
  let dynamicHandleStyle = defaultStyle.handle;
  let dynamicIcon = defaultStyle.icon;

  if (isGapFoundNode) {
    // Gap Found / Recommendation: Fractions node turns fully red/orange
    dynamicCardStyle =
      'border-red-500 bg-red-950/90 shadow-2xl shadow-red-500/70 ring-2 ring-red-400 animate-pulse';
    dynamicHandleStyle = '!bg-red-500';
    dynamicIcon = <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 animate-bounce" />;
  } else if (isScanningTarget) {
    // Scanning state: Quadratic node pulses red immediately
    dynamicCardStyle =
      'border-red-500 shadow-xl shadow-red-500/50 bg-slate-900/95 animate-pulse ring-2 ring-red-500/50';
    dynamicHandleStyle = '!bg-red-500';
    dynamicIcon = <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />;
  } else if (isOnPath) {
    // Path revealing state: highlight nodes along the gap path
    dynamicCardStyle =
      'border-amber-400 shadow-xl shadow-amber-400/40 bg-slate-900/95 ring-1 ring-amber-400/50';
    dynamicHandleStyle = '!bg-amber-400';
  }

  return (
    <div
      className={`w-[220px] border rounded-xl p-3 text-white select-none transition-all duration-500 ${dynamicCardStyle} ${
        isDimmed ? 'opacity-20 blur-[0.5px]' : 'opacity-100'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-3 !h-3 !border-2 !border-slate-900 ${dynamicHandleStyle}`}
      />

      {/* Header with Title and Status Icon */}
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-semibold text-sm text-slate-100 truncate pr-2" title={title}>
          {title}
        </h3>
        {dynamicIcon}
      </div>

      {/* Mastery Progress Bar (hidden when locked, shown for gap node) */}
      {(!isLocked || isGapFoundNode) && (
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isGapFoundNode ? 'bg-red-500' : defaultStyle.bar
            }`}
            style={{ width: `${Math.min(100, Math.max(0, mastery))}%` }}
          />
        </div>
      )}

      {/* Metadata Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-1">
        <span className="flex items-center gap-1">
          <RotateCcw className="w-3 h-3 text-slate-500" />
          {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          {formatTime(timeSpent)}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-3 !h-3 !border-2 !border-slate-900 ${dynamicHandleStyle}`}
      />
    </div>
  );
}
