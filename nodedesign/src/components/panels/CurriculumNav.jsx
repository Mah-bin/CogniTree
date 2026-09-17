import React from 'react';
import { BookOpen, Compass, Layers, Sparkles } from 'lucide-react';

const statusDotColors = {
  mastered: 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
  current: 'bg-sky-400 shadow-sm shadow-sky-400/50 animate-pulse',
  learning: 'bg-sky-400 shadow-sm shadow-sky-400/50 animate-pulse',
  struggling: 'bg-amber-400 shadow-sm shadow-amber-400/50',
  gap: 'bg-red-400 shadow-sm shadow-red-400/50 animate-pulse',
  locked: 'bg-slate-600',
};

export default function CurriculumNav({
  topics = [],
  selectedNodeId,
  onSelectTopic,
}) {
  return (
    <aside className="w-[260px] shrink-0 h-full border-r border-slate-800/80 bg-slate-900/50 pt-16 p-4 flex flex-col justify-between select-none overflow-y-auto no-scrollbar">
      <div className="space-y-4">
        {/* Nav Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Curriculum Topics</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700/50 font-mono">
            {topics.length}
          </span>
        </div>

        {/* Topic List */}
        <nav className="space-y-1">
          {topics.map((topic) => {
            const isSelected = selectedNodeId === topic.id;
            const dotStyle = statusDotColors[topic.status] || statusDotColors.locked;

            return (
              <button
                key={topic.id}
                onClick={() => onSelectTopic && onSelectTopic(topic.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-md ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotStyle}`} />
                  <span className="truncate">{topic.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono capitalize">
                  {topic.mastery}%
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
        <div className="flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Compass className="w-3 h-3 text-slate-500" /> Interactive Nav
          </span>
          <span className="text-emerald-400 font-mono">Auto-Focus</span>
        </div>
      </div>
    </aside>
  );
}
