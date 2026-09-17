import React, { useState, useMemo, useEffect } from 'react';
import '@xyflow/react/dist/style.css';
import Graph from './components/graph/Graph';
import InsightPanel from './components/panels/InsightPanel';
import DiagnosticPanel from './components/panels/DiagnosticPanel';
import CurriculumNav from './components/panels/CurriculumNav';
import TopBar from './components/ui/TopBar';
import { useDiagnosticScan } from './hooks/useDiagnosticScan';
import { useCurriculum } from './core/CurriculumContext';

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  
  // Person 1's Core Logic
  const { graph, progress, diagnoses, answer } = useCurriculum();
  
  // Map Person 1's logic into Person 2's UI structure
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
        prerequisites: n.prereqs, // Map for Person 2's adapter
        mastery,
        status: uiStatus,
        attempts: p?.attempts || 0,
        timeSpent: p?.msOnNode ? p.msOnNode / 1000 : 0,
        difficulty: 'medium'
      };
    });
  }, [graph, progress]);

  // Handle Diagnostic Animation State
  const latestDiagnosis = diagnoses[0] || null;
  const diagnosticScan = useDiagnosticScan(latestDiagnosis?.path || []);
  const { stage, runScan, resetScan } = diagnosticScan;
  const lastScannedRef = React.useRef(null);

  // Trigger animation automatically when a new diagnosis arrives
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

  // Demo helper: Simulate a wrong answer on the Area node
  const handleSimulateQuiz = () => {
    // Faking a wrong answer on Area that blames Multiplication
    answer('area', 'area.q1', { id: 'b', text: '10', correct: false, blame: 'multiplication', reason: 'Added instead of multiplied' });
  };

  return (
    <div className="w-screen h-screen flex bg-slate-950 overflow-hidden font-sans">
      <CurriculumNav
        topics={rawNodes}
        selectedNodeId={selectedNodeId}
        onSelectTopic={setSelectedNodeId}
      />

      <main className="flex-1 h-full relative overflow-hidden">
        <TopBar
          studentName="Hackathon Demo"
          overallMastery={overallMastery}
          stage={stage}
          onRunScan={handleSimulateQuiz} // Overriding runScan with our real logic simulation
          onResetScan={resetScan}
        />
        <Graph
          curriculumNodes={rawNodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          diagnosticState={{ ...diagnosticScan, gapPath: latestDiagnosis?.path || [] }}
        />
      </main>

      {stage === 'recommendation' ? (
        <DiagnosticPanel
          onResetScan={resetScan}
          onStartDetour={() => setSelectedNodeId(latestDiagnosis?.gapNode)}
          diagnosis={latestDiagnosis}
          allNodes={rawNodes}
        />
      ) : (
        <InsightPanel
          selectedNode={selectedNode}
          allNodes={rawNodes}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
