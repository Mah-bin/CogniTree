import React, { useState, useMemo, useEffect } from 'react';
import '@xyflow/react/dist/style.css';
import ScrollHero from './components/hero/ScrollHero';
import Graph from './components/graph/Graph';
import InsightPanel from './components/panels/InsightPanel';
import DiagnosticPanel from './components/panels/DiagnosticPanel';
import CurriculumNav from './components/panels/CurriculumNav';
import TopBar from './components/ui/TopBar';
import LoginModal from './components/auth/LoginModal';
import { useDiagnosticScan } from './hooks/useDiagnosticScan';
import { mockCurriculumData } from './data/mockData';
import { personOneContractData } from './data/personOneMock';
import { adaptPersonOneData } from './data/adapter';

const USE_MOCK = true;

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
  const diagnosticScan = useDiagnosticScan();
  const { stage, runScan, resetScan } = diagnosticScan;

  useEffect(() => {
    localStorage.setItem('cognitree_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
      if (window.location.hash === '#node-design') {
        setView('nodedesign');
      } else if (window.location.hash === '#hero') {
        setView('hero');
      }
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

  // Load curriculum dataset based on USE_MOCK flag
  const activeDataset = useMemo(() => {
    if (USE_MOCK) {
      return {
        rawNodes: mockCurriculumData,
        student: { name: user ? user.name : 'Alex Rivera', id: user ? user.id || 'alex-101' : 'alex-101' },
      };
    }
    const adapted = adaptPersonOneData(personOneContractData);
    return {
      rawNodes: adapted.rawNodes,
      student: { name: user ? user.name : adapted.student.name, id: adapted.student.id },
    };
  }, [user]);

  // Compute dynamic overall mastery percentage across all nodes
  const overallMastery = useMemo(() => {
    if (!activeDataset.rawNodes || activeDataset.rawNodes.length === 0) return 0;
    const total = activeDataset.rawNodes.reduce((acc, n) => acc + (n.mastery || 0), 0);
    return Math.round(total / activeDataset.rawNodes.length);
  }, [activeDataset.rawNodes]);

  const selectedNode = activeDataset.rawNodes.find((n) => n.id === selectedNodeId) || null;

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
          {/* Left Curriculum Navigation Sidebar */}
          <CurriculumNav
            topics={activeDataset.rawNodes}
            selectedNodeId={selectedNodeId}
            onSelectTopic={setSelectedNodeId}
            theme={theme}
          />

          {/* Middle Graph Area */}
          <main className="flex-1 h-full relative overflow-hidden">
            <TopBar
              studentName={activeDataset.student.name}
              overallMastery={overallMastery}
              stage={stage}
              onRunScan={runScan}
              onResetScan={resetScan}
              onBackToHero={handleBackToHero}
              theme={theme}
              onToggleTheme={toggleTheme}
              user={user}
              onOpenLogin={openSignIn}
              onLogout={handleLogout}
            />
            <Graph
              curriculumNodes={activeDataset.rawNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              diagnosticState={diagnosticScan}
              theme={theme}
            />
          </main>

          {/* Right Panel: DiagnosticPanel on recommendation stage, InsightPanel otherwise */}
          {stage === 'recommendation' ? (
            <DiagnosticPanel
              onResetScan={resetScan}
              onStartDetour={() => {
                setSelectedNodeId('fractions');
              }}
              theme={theme}
            />
          ) : (
            <InsightPanel
              selectedNode={selectedNode}
              allNodes={activeDataset.rawNodes}
              onClose={() => setSelectedNodeId(null)}
              theme={theme}
            />
          )}
        </div>
      )}

      {/* Authentication Login / Sign Up Modal */}
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
