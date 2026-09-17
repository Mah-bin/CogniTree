import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
} from '@xyflow/react';
import ConceptNode from '../nodes/ConceptNode';
import { mapNodesToFlow } from '../../data/adapter';

const nodeTypes = {
  concept: ConceptNode,
};

function GraphInner({ curriculumNodes = [], selectedNodeId, onSelectNode, diagnosticState }) {
  const { stage = 'idle', gapPath = [], revealedCount = 0 } = diagnosticState || {};
  const { fitView } = useReactFlow();

  // Map raw nodes using shared adapter mapper
  const baseFlow = useMemo(() => {
    return mapNodesToFlow(curriculumNodes);
  }, [curriculumNodes]);

  // Pan / center to selected node when selectedNodeId changes
  useEffect(() => {
    if (selectedNodeId) {
      fitView({
        nodes: [{ id: selectedNodeId }],
        duration: 800,
        minZoom: 1.0,
        maxZoom: 1.4,
      });
    }
  }, [selectedNodeId, fitView]);

  // Compute revealed nodes along the gap path
  const revealedNodes = useMemo(() => {
    if (stage === 'idle' || stage === 'scanning') return [];
    return gapPath.slice(0, revealedCount);
  }, [stage, gapPath, revealedCount]);

  const revealedSet = useMemo(() => new Set(revealedNodes), [revealedNodes]);

  // Inject diagnostic scan states onto React Flow nodes
  const nodes = useMemo(() => {
    return baseFlow.nodes.map((node) => {
      const isScanningTarget = node.id === gapPath[0] && stage === 'scanning';
      const isGapFoundNode =
        node.id === gapPath[gapPath.length - 1] && (stage === 'gap-found' || stage === 'recommendation');
      const isOnPath = revealedSet.has(node.id);
      const isDimmed = stage !== 'idle' && stage !== 'scanning' && !revealedSet.has(node.id);

      return {
        ...node,
        data: {
          ...node.data,
          isScanningTarget,
          isGapFoundNode,
          isOnPath,
          isDimmed,
        },
      };
    });
  }, [baseFlow.nodes, stage, revealedSet, gapPath]);

  // Inject diagnostic path highlighting onto React Flow edges
  const edges = useMemo(() => {
    return baseFlow.edges.map((edge) => {
      const isEdgeOnPath = revealedSet.has(edge.source) && revealedSet.has(edge.target);
      const isScanActive = stage !== 'idle' && stage !== 'scanning';

      if (isEdgeOnPath) {
        return {
          ...edge,
          style: {
            stroke: '#ef4444',
            strokeWidth: 3.5,
            opacity: 1,
          },
          animated: true,
        };
      }

      if (isScanActive) {
        return {
          ...edge,
          style: {
            ...edge.style,
            opacity: 0.15,
          },
        };
      }

      return edge;
    });
  }, [baseFlow.edges, stage, revealedSet]);

  const handleNodeClick = useCallback(
    (event, node) => {
      if (onSelectNode) {
        onSelectNode(node.id);
      }
    },
    [onSelectNode]
  );

  return (
    <div className="w-full h-full bg-slate-950 pt-14">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default function Graph(props) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
