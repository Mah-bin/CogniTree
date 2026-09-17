import React, { useState, useEffect } from 'react';
import {
  Brain,
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  theme = 'dark',
  initialMode = 'signin'
}) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('alex.rivera@cognitree.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Alex Rivera');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isLight = theme === 'light';

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: mode === 'signup' ? name || 'New Scholar' : name || 'Alex Rivera',
        email,
        role: 'Student',
        id: 'user-' + Math.floor(Math.random() * 1000)
      });
      onClose();
    }, 800);
  };

  const handleDemoLogin = (roleName, demoEmail, demoName) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: demoName,
        email: demoEmail,
        role: roleName,
        id: 'demo-' + roleName.toLowerCase()
      });
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl z-10 transition-all overflow-hidden ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-900/10'
            : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-emerald-950/40'
        }`}
      >
        {/* Glow Accents */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-1">
            <Brain className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {mode === 'signin' ? 'Welcome Back to CogniTree' : 'Join CogniTree LMS'}
          </h2>
          <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {mode === 'signup'
              ? 'Create an account to explore node design and interactive curriculum'
              : 'Access interactive concept graphs, diagnostic scans & learning paths'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className={`flex p-1 rounded-2xl border mb-6 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signin'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-slate-800 text-white shadow-sm'
                : isLight
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-slate-800 text-white shadow-sm'
                : isLight
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`w-4 h-4 absolute left-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      : 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.rivera@cognitree.edu"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3.5 top-3 transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create Account & Enter'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <span className={`block text-[11px] font-bold text-center uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Quick 1-Click Demo Logins
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('Student', 'alex.rivera@cognitree.edu', 'Alex Rivera')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Alex (Student)</span>
            </button>

            <button
              onClick={() => handleDemoLogin('Educator', 'sarah.chen@cognitree.edu', 'Dr. Sarah Chen')}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Sarah (Educator)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
