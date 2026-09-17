import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Brain,
  Zap,
  GitFork,
  CheckCircle2,
  RotateCcw,
  Sun,
  Moon,
  LogIn,
  LogOut
} from 'lucide-react';

const TOTAL_FRAMES = 598;

export default function ScrollHero({
  onExploreNodeDesign,
  theme = 'dark',
  onToggleTheme,
  user,
  onOpenLogin,
  onLogout
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const animFrameRef = useRef(null);
  const targetFrameRef = useRef(0);
  const currentFrameFloatRef = useRef(0);
  const imagesRef = useRef([]);

  const isLight = theme === 'light';

  // Preload frames progressively
  useEffect(() => {
    let isMounted = true;
    const loadedImages = new Array(TOTAL_FRAMES);
    let loadedCounter = 0;

    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        const frameNum = String(index + 1).padStart(3, '0');
        img.src = `/frames/frame_${frameNum}.jpg`;

        img.onload = () => {
          if (!isMounted) return resolve();
          loadedImages[index] = img;
          loadedCounter++;
          setLoadedCount(loadedCounter);
          setLoadingProgress(Math.round((loadedCounter / TOTAL_FRAMES) * 100));
          resolve(img);
        };

        img.onerror = () => {
          if (!isMounted) return resolve();
          loadedCounter++;
          setLoadedCount(loadedCounter);
          resolve(null);
        };
      });
    };

    const loadAllFrames = async () => {
      const initialPromises = [];
      for (let i = 0; i < Math.min(30, TOTAL_FRAMES); i++) {
        initialPromises.push(loadImage(i));
      }
      await Promise.all(initialPromises);
      if (isMounted) {
        setImages([...loadedImages]);
        imagesRef.current = loadedImages;
        setIsLoaded(true);
      }

      const chunkSize = 25;
      for (let i = 30; i < TOTAL_FRAMES; i += chunkSize) {
        if (!isMounted) break;
        const chunkPromises = [];
        for (let j = i; j < Math.min(i + chunkSize, TOTAL_FRAMES); j++) {
          chunkPromises.push(loadImage(j));
        }
        await Promise.all(chunkPromises);
        if (isMounted) {
          setImages([...loadedImages]);
          imagesRef.current = loadedImages;
        }
      }
    };

    loadAllFrames();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderCanvasFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      let fallbackImg = null;
      for (let offset = 1; offset < 50; offset++) {
        if (imagesRef.current[frameIdx - offset]?.complete) {
          fallbackImg = imagesRef.current[frameIdx - offset];
          break;
        }
        if (imagesRef.current[frameIdx + offset]?.complete) {
          fallbackImg = imagesRef.current[frameIdx + offset];
          break;
        }
      }
      if (!fallbackImg) return;
      drawImgToCanvas(ctx, canvas, fallbackImg);
      return;
    }

    drawImgToCanvas(ctx, canvas, img);
  }, []);

  const drawImgToCanvas = (ctx, canvas, img) => {
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    const scale = Math.max(cw / iw, ch / ih);
    const x = (cw - iw * scale) / 2;
    const y = (ch - ih * scale) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, iw * scale, ih * scale);
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      renderCanvasFrame(Math.round(currentFrameFloatRef.current));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvasFrame]);

  useEffect(() => {
    let lastFrame = -1;

    const updateLoop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameFloatRef.current;

      const diff = target - current;
      if (Math.abs(diff) > 0.001) {
        currentFrameFloatRef.current += diff * 0.25;
      } else {
        currentFrameFloatRef.current = target;
      }

      const intFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.round(currentFrameFloatRef.current))
      );

      if (intFrame !== lastFrame) {
        lastFrame = intFrame;
        setCurrentFrame(intFrame);
        renderCanvasFrame(intFrame);
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderCanvasFrame]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const rawRatio = scrolled / totalScrollable;
      const clampedRatio = Math.min(1, Math.max(0, rawRatio));

      setScrollPercent(Math.round(clampedRatio * 100));

      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(clampedRatio * (TOTAL_FRAMES - 1)))
      );

      targetFrameRef.current = frameIndex;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBookOpen = () => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
    window.scrollTo({ top: totalHeight, behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className={`relative font-sans selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300 ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
      style={{ height: '550vh' }}
    >
      {/* Sticky Fullscreen Canvas Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ width: '100vw', height: '100vh' }}
        />

        {/* Ambient Overlay for Light vs Dark */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            isLight
              ? 'bg-gradient-to-b from-slate-100/70 via-transparent to-slate-100/80'
              : 'bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90'
          }`}
        />

        {/* Top Floating Header Bar */}
        <header
          className={`absolute top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b transition-colors duration-300 ${
            isLight
              ? 'bg-white/80 border-slate-200/80 shadow-sm text-slate-900'
              : 'bg-slate-950/40 border-white/10 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 animate-pulse">
              <Brain className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span
                className={`font-black text-lg tracking-tight flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                CogniTree{' '}
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold">
                  Tome Edition
                </span>
              </span>
              <p className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Scroll-Animated Learning Graph
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Scroll Progress Meter in TopBar */}
            <div
              className={`hidden sm:flex items-center gap-3 border px-4 py-1.5 rounded-full text-xs transition-colors ${
                isLight
                  ? 'bg-slate-50/90 border-slate-200 text-slate-700'
                  : 'bg-slate-900/80 border-white/10 text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">Tome Progress:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{scrollPercent}%</span>
              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                  style={{ width: `${scrollPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Frame {currentFrame + 1}/{TOTAL_FRAMES}
              </span>
            </div>

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
                title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {isLight ? (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden md:inline">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline">Light</span>
                  </>
                )}
              </button>
            )}

            {/* Login / Profile Button */}
            {user ? (
              <button
                onClick={onLogout}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-red-600 border-slate-300'
                    : 'bg-slate-800/80 hover:bg-red-500/20 text-slate-200 hover:text-red-400 border-slate-700'
                }`}
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Direct Jump CTA */}
            <button
              onClick={onExploreNodeDesign}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Explore Node Design</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Loading Overlay Bar on initial frame fetch */}
        {!isLoaded && (
          <div
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6 text-center transition-colors ${
              isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
            }`}
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Brain className="w-7 h-7 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold">Opening the Tome of Cognition...</h3>
              <p className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Preloading 598 smooth animation frames ({loadingProgress}%)
              </p>
            </div>
            <div className="w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300 dark:border-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STAGE 1: Frames 0 - 140 (Initial Hook & Introduction) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-700 pointer-events-none ${
            currentFrame <= 140
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-10 scale-95'
          }`}
        >
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-inner">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Interactive Scroll Experience • 598 Frames
            </div>

            <h1
              className={`text-5xl sm:text-7xl font-black tracking-tight leading-tight drop-shadow-2xl ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              The Unwritten <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                Learning Journey
              </span>
            </h1>

            <p
              className={`text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Scroll down to unfold the ancient tome of knowledge. Every page turn brings clarity to prerequisite concept trees and diagnostic mastery.
            </p>

            {/* Animated Scroll Indicator */}
            <div className="pt-8 flex flex-col items-center gap-2 pointer-events-auto">
              <button
                onClick={scrollToBookOpen}
                className={`flex flex-col items-center gap-2 group cursor-pointer transition-colors ${
                  isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <span className="text-xs uppercase font-bold tracking-widest">
                  Scroll to open the tome
                </span>
                <div
                  className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5 transition-colors ${
                    isLight
                      ? 'border-slate-400 group-hover:border-emerald-600'
                      : 'border-slate-600 group-hover:border-emerald-400'
                  }`}
                >
                  <div className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* STAGE 2: Frames 141 - 320 (Concept 1: Knowledge Graph Structure) */}
        <div
          className={`absolute inset-0 flex items-center justify-start px-8 sm:px-16 transition-all duration-700 pointer-events-none ${
            currentFrame > 140 && currentFrame <= 320
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-12'
          }`}
        >
          <div
            className={`max-w-md backdrop-blur-xl border p-8 rounded-3xl shadow-2xl space-y-4 pointer-events-auto transition-colors ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-800'
                : 'bg-slate-950/80 border-white/10 text-white'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500">
              <GitFork className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Feature Highlight 01
            </span>
            <h2 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Visual Concept Dependencies
            </h2>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Curriculum isn't a linear list — it's an interconnected graph. See how foundational topics branch out into advanced mastery with active node relationships.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Interactive React Flow Canvas</span>
            </div>
          </div>
        </div>

        {/* STAGE 3: Frames 321 - 460 (Concept 2: Diagnostic & Gap Tracing) */}
        <div
          className={`absolute inset-0 flex items-center justify-end px-8 sm:px-16 transition-all duration-700 pointer-events-none ${
            currentFrame > 320 && currentFrame <= 460
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-12'
          }`}
        >
          <div
            className={`max-w-md backdrop-blur-xl border p-8 rounded-3xl shadow-2xl space-y-4 pointer-events-auto transition-colors ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-800'
                : 'bg-slate-950/80 border-white/10 text-white'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-500">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Feature Highlight 02
            </span>
            <h2 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Real-Time Diagnostic Tracing
            </h2>
            <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Detect root-cause misconceptions automatically. Trace diagnostic detours instantly to fix missing prerequisites before embarking on complex topics.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Automated Prerequisite Detours</span>
            </div>
          </div>
        </div>

        {/* STAGE 4: Frames 461 - 598 (Book Fully Opens: Grand CTA Reveal) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-all duration-700 pointer-events-none ${
            currentFrame > 460
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-12 scale-95'
          }`}
        >
          <div
            className={`max-w-2xl backdrop-blur-2xl border p-8 sm:p-12 rounded-3xl shadow-2xl space-y-6 pointer-events-auto relative overflow-hidden group transition-colors ${
              isLight
                ? 'bg-white/95 border-emerald-500/30 text-slate-900 shadow-emerald-500/10'
                : 'bg-slate-950/85 border-emerald-500/30 text-white shadow-emerald-500/10'
            }`}
          >
            {/* Glowing Accent Ring */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl group-hover:bg-teal-500/30 transition-all duration-700" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              Tome Opened • Knowledge Revealed
            </div>

            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Ready to Explore the <br />
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                CogniTree Node Design?
              </span>
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              The book is now wide open. Step into the full interactive node graph to analyze student mastery, run diagnostic scans, and navigate curriculum detours.
            </p>

            {/* Main Interactive CTA Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onExploreNodeDesign}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span>Enter Node Design Workspace</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={scrollToTop}
                className={`w-full sm:w-auto px-6 py-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Book Scroll</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
