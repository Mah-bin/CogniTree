import React, { useState, useMemo } from 'react';
import '@xyflow/react/dist/style.css';
import Graph from './components/graph/Graph';
import InsightPanel from './components/panels/InsightPanel';
import DiagnosticPanel from './components/panels/DiagnosticPanel';
import CurriculumNav from './components/panels/CurriculumNav';
import TopBar from './components/ui/TopBar';
import { useDiagnosticScan } from './hooks/useDiagnosticScan';
import { mockCurriculumData } from './data/mockData';
import { personOneContractData } from './data/personOneMock';
import { adaptPersonOneData } from './data/adapter';

const USE_MOCK = true;

export default function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const diagnosticScan = useDiagnosticScan();
  const { stage, runScan, resetScan } = diagnosticScan;

  // Load curriculum dataset based on USE_MOCK flag
  const activeDataset = useMemo(() => {
    if (USE_MOCK) {
      return {
        rawNodes: mockCurriculumData,
        student: { name: 'Alex Rivera', id: 'alex-101' },
      };
    }
    const adapted = adaptPersonOneData(personOneContractData);
    return {
      rawNodes: adapted.rawNodes,
      student: adapted.student,
    };
  }, []);

  // Compute dynamic overall mastery percentage across all nodes
  const overallMastery = useMemo(() => {
    if (!activeDataset.rawNodes || activeDataset.rawNodes.length === 0) return 0;
    const total = activeDataset.rawNodes.reduce((acc, n) => acc + (n.mastery || 0), 0);
    return Math.round(total / activeDataset.rawNodes.length);
  }, [activeDataset.rawNodes]);

  const selectedNode = activeDataset.rawNodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="w-screen h-screen flex bg-slate-950 overflow-hidden font-sans">
      {/* Left Curriculum Navigation Sidebar */}
      <CurriculumNav
        topics={activeDataset.rawNodes}
        selectedNodeId={selectedNodeId}
        onSelectTopic={setSelectedNodeId}
      />

      {/* Middle Graph Area */}
      <main className="flex-1 h-full relative overflow-hidden">
        <TopBar
          studentName={activeDataset.student.name}
          overallMastery={overallMastery}
          stage={stage}
          onRunScan={runScan}
          onResetScan={resetScan}
        />
        <Graph
          curriculumNodes={activeDataset.rawNodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          diagnosticState={diagnosticScan}
        />
      </main>

      {/* Right Panel: DiagnosticPanel on recommendation stage, InsightPanel otherwise */}
      {stage === 'recommendation' ? (
        <DiagnosticPanel
          onResetScan={resetScan}
          onStartDetour={() => {
            setSelectedNodeId('fractions');
          }}
        />
      ) : (
        <InsightPanel
          selectedNode={selectedNode}
          allNodes={activeDataset.rawNodes}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
