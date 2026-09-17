import React from 'react';
import {
  Activity,
  Loader2,
  GitPullRequest,
  AlertOctagon,
  RotateCcw,
  User,
  Award,
  Brain,
  BookOpen,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function TopBar({
  studentName = 'Alex Rivera',
  overallMastery = 72,
  stage,
  onRunScan,
  onResetScan,
  onBackToHero,
  theme = 'dark',
  onToggleTheme,
  user,
  onOpenLogin,
  onLogout,
  onOpenAnalytics,
}) {
  const isScanning = stage !== 'idle' && stage !== 'recommendation';
  const isLight = theme === 'light';

  const currentUser = user || { name: studentName, email: 'alex.rivera@cognitree.edu', role: 'Student' };

  return (
    <header
      className={`absolute top-0 left-0 right-0 z-20 h-14 backdrop-blur-md border-b px-5 flex items-center justify-between select-none transition-colors duration-300 ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
          : 'bg-slate-900/90 border-slate-800/80 text-white'
      }`}
    >
      {/* Left: Branding & Back to Hero */}
      <div className="flex items-center gap-3">
        {onBackToHero && (
          <button
            onClick={onBackToHero}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/70'
            }`}
            title="Return to 598-Frame Scroll Animated Tome"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Tome Hero</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <Brain className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span
            className={`font-extrabold text-sm tracking-tight flex items-center gap-1.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            CogniTree
          </span>
        </div>
      </div>

      {/* Center: Student Name & Overall Mastery */}
      <div
        className={`flex items-center gap-3 border px-4 py-1 rounded-full text-xs transition-colors ${
          isLight
            ? 'bg-slate-100/90 border-slate-200 text-slate-700'
            : 'bg-slate-950/60 border-slate-800/80 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5 font-medium">
          <User className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <span>{currentUser.name}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            {currentUser.role || 'Student'}
          </span>
        </div>
        <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>•</span>
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-500" />
          <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Overall Mastery:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{overallMastery}%</span>
        </div>
      </div>

      {/* Right: Scan Controls, Auth & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {stage === 'scanning' && (
          <span className="flex items-center gap-2 text-xs font-semibold text-amber-500 pr-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Scanning...
          </span>
        )}
        {stage === 'path-revealing' && (
          <span className="flex items-center gap-2 text-xs font-semibold text-sky-500 pr-1">
            <GitPullRequest className="w-3.5 h-3.5 animate-pulse" />
            Tracing Dependencies...
          </span>
        )}
        {stage === 'gap-found' && (
          <span className="flex items-center gap-2 text-xs font-semibold text-red-500 pr-1">
            <AlertOctagon className="w-3.5 h-3.5 animate-bounce" />
            Gap Found!
          </span>
        )}

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon className="w-4 h-4 text-indigo-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        )}

        {/* Login / Auth Button */}
        {user ? (
          <button
            onClick={onLogout}
            className={`p-1.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isLight
                ? 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border-slate-300'
                : 'bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border-slate-700/60'
            }`}
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Log Out</span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        <button
          onClick={onRunScan}
          disabled={isScanning}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
            isScanning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95 cursor-pointer'
          }`}
        >
          <Activity className={`w-3.5 h-3.5 ${isScanning ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">Cognitive Scan</span>
        </button>

        {onOpenAnalytics && (
          <button
            onClick={onOpenAnalytics}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>Analytics</span>
          </button>
        )}

        {stage === 'recommendation' && (
          <button
            onClick={onResetScan}
            className={`p-1.5 rounded-xl border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/60'
            }`}
            title="Reset scan state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
}
