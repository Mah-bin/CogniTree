import React, { useState, useMemo, useEffect } from 'react';
import '@xyflow/react/dist/style.css';
import ScrollHero from './components/hero/ScrollHero';
import Graph from './components/graph/Graph';
import InsightPanel from './components/panels/InsightPanel';
import DiagnosticPanel from './components/panels/DiagnosticPanel';
import CurriculumNav from './components/panels/CurriculumNav';
import TopBar from './components/ui/TopBar';
import LoginModal from './components/auth/LoginModal';
import QuizModal from './components/QuizModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { useDiagnosticScan } from './hooks/useDiagnosticScan';
import { useCurriculum } from './core/CurriculumContext';

export default function App() {
  const [view, setView] = useState(() => {
    if (window.location.hash === '#node-design') return 'nodedesign';
    return 'hero';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cognitree_theme') || 'dark';
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('signin');

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cognitree_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: 'Alex Rivera', email: 'alex.rivera@cognitree.edu', role: 'Student' };
  });

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [quizNodeId, setQuizNodeId] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { graph, progress, diagnoses, answer } = useCurriculum();

  const rawNodes = useMemo(() => {
    return graph.nodes.map(n => {
      const p = progress[n.id];
      let mastery = 0;
      let uiStatus = p?.status || 'locked';

      if (uiStatus === 'mastered') mastery = 100;
      else if (uiStatus === 'in_progress') mastery = p.correct > 0 ? 50 : 0;
      else if (uiStatus === 'gap') mastery = 20;

      if (uiStatus === 'available' || uiStatus === 'in_progress') uiStatus = 'current';

      return {
        ...n,
        prerequisites: n.prereqs,
        mastery,
        status: uiStatus,
        attempts: p?.attempts || 0,
        timeSpent: p?.msOnNode ? p.msOnNode / 1000 : 0,
        difficulty: 'medium'
      };
    });
  }, [graph, progress]);

  useEffect(() => {
    localStorage.setItem('cognitree_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('cognitree_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cognitree_user');
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#node-design') setView('nodedesign');
      else if (window.location.hash === '#hero') setView('hero');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleExploreNodeDesign = () => {
    if (!user) {
      setLoginModalMode('signup');
      setIsLoginOpen(true);
      return;
    }
    window.location.hash = '#node-design';
    setView('nodedesign');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToHero = () => {
    window.location.hash = '#hero';
    setView('hero');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openSignIn = () => {
    setLoginModalMode('signin');
    setIsLoginOpen(true);
  };

  const latestDiagnosis = diagnoses[0] || null;
  const diagnosticScan = useDiagnosticScan(latestDiagnosis?.path || []);
  const { stage, runScan, resetScan } = diagnosticScan;
  const lastScannedRef = React.useRef(null);

  useEffect(() => {
    if (latestDiagnosis && latestDiagnosis !== lastScannedRef.current && stage === 'idle') {
      lastScannedRef.current = latestDiagnosis;
      runScan();
    }
  }, [latestDiagnosis, stage, runScan]);

  const overallMastery = useMemo(() => {
    if (!rawNodes || rawNodes.length === 0) return 0;
    const total = rawNodes.reduce((acc, n) => acc + (n.mastery || 0), 0);
    return Math.round(total / rawNodes.length);
  }, [rawNodes]);

  const selectedNode = rawNodes.find((n) => n.id === selectedNodeId) || null;

  const handleSimulateQuiz = () => {
    answer('area', 'area.q1', { id: 'b', text: '10', correct: false, blame: 'multiplication', reason: 'Added instead of multiplied' });
  };

  return (
    <>
      {view === 'hero' ? (
        <ScrollHero
          onExploreNodeDesign={handleExploreNodeDesign}
          theme={theme}
          onToggleTheme={toggleTheme}
          user={user}
          onOpenLogin={openSignIn}
          onLogout={handleLogout}
        />
      ) : (
        <div
          className={`w-screen h-screen flex overflow-hidden font-sans relative transition-colors duration-300 ${
            theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
          }`}
        >
          <CurriculumNav
            topics={rawNodes}
            selectedNodeId={selectedNodeId}
            onSelectTopic={setSelectedNodeId}
            theme={theme}
          />

          <main className="flex-1 h-full relative overflow-hidden">
            <TopBar
              studentName={user ? user.name : 'Hackathon Demo'}
              overallMastery={overallMastery}
              stage={stage}
              onRunScan={handleSimulateQuiz}
              onResetScan={resetScan}
              onBackToHero={handleBackToHero}
              theme={theme}
              onToggleTheme={toggleTheme}
              user={user}
              onOpenLogin={openSignIn}
              onLogout={handleLogout}
              onOpenAnalytics={() => setShowAnalytics(true)}
            />
            <Graph
              curriculumNodes={rawNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              diagnosticState={{ ...diagnosticScan, gapPath: latestDiagnosis?.path || [] }}
              theme={theme}
            />
          </main>

          {stage === 'recommendation' ? (
            <DiagnosticPanel
              onResetScan={resetScan}
              onStartDetour={() => setSelectedNodeId(latestDiagnosis?.gapNode)}
              diagnosis={latestDiagnosis}
              allNodes={rawNodes}
              theme={theme}
            />
          ) : (
            <InsightPanel
              selectedNode={selectedNode}
              allNodes={rawNodes}
              onClose={() => setSelectedNodeId(null)}
              theme={theme}
              onStartQuiz={selectedNode ? () => setQuizNodeId(selectedNode.id) : undefined}
            />
          )}

          {quizNodeId && (
            <QuizModal
              nodeId={quizNodeId}
              onClose={() => setQuizNodeId(null)}
            />
          )}

          {showAnalytics && (
            <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-sm p-6 flex items-center justify-center">
              <AnalyticsDashboard
                onClose={() => setShowAnalytics(false)}
                onSelectNode={(nodeId) => {
                  setSelectedNodeId(nodeId);
                  setShowAnalytics(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      <LoginModal
        isOpen={isLoginOpen}
        initialMode={loginModalMode}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
      />
    </>
  );
}