import React from 'react';
import { Layers, Compass } from 'lucide-react';

const statusDotColors = {
  mastered: 'bg-emerald-500 shadow-sm shadow-emerald-500/50',
  current: 'bg-sky-500 shadow-sm shadow-sky-500/50 animate-pulse',
  learning: 'bg-sky-500 shadow-sm shadow-sky-500/50 animate-pulse',
  struggling: 'bg-amber-500 shadow-sm shadow-amber-500/50',
  gap: 'bg-red-500 shadow-sm shadow-red-500/50 animate-pulse',
  locked: 'bg-slate-400 dark:bg-slate-600',
};

export default function CurriculumNav({
  topics = [],
  selectedNodeId,
  onSelectTopic,
  theme = 'dark',
}) {
  const isLight = theme === 'light';

  return (
    <aside
      className={`w-[260px] shrink-0 h-full border-r pt-16 p-4 flex flex-col justify-between select-none overflow-y-auto no-scrollbar transition-colors duration-300 ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-slate-900/50 border-slate-800/80 text-slate-100'
      }`}
    >
      <div className="space-y-4">
        {/* Nav Header */}
        <div className="flex items-center justify-between px-1">
          <div
            className={`flex items-center gap-2 font-semibold text-xs uppercase tracking-wider ${
              isLight ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>Curriculum Topics</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${
              isLight
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-slate-800 text-slate-400 border-slate-700/50'
            }`}
          >
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-md ring-1 ring-emerald-500/30'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dotStyle}`} />
                  <span className="truncate">{topic.title}</span>
                </div>
                <span className={`text-[10px] font-mono capitalize ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  {topic.mastery}%
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div
        className={`pt-3 border-t text-[11px] ${
          isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-400'
        }`}
      >
        <div className="flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-400" /> Interactive Nav
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono">Auto-Focus</span>
        </div>
      </div>
    </aside>
  );
}
