// Shared node-to-ReactFlow mapper applied across mock data and Person 1 contract data
export function mapNodesToFlow(rawNodes) {
  const nodeMap = new Map(rawNodes.map((n) => [n.id, n]));
  const nodeIds = new Set(rawNodes.map((n) => n.id));

  // Check for node coordinate overlaps (~220px x ~90px card dimensions)
  for (let i = 0; i < rawNodes.length; i++) {
    for (let j = i + 1; j < rawNodes.length; j++) {
      const n1 = rawNodes[i];
      const n2 = rawNodes[j];
      const dx = Math.abs(n1.position.x - n2.position.x);
      const dy = Math.abs(n1.position.y - n2.position.y);
      if (dx < 220 && dy < 90) {
        console.warn(
          `[Graph Overlap Warning] Node "${n1.id}" (${n1.title}) and Node "${n2.id}" (${n2.title}) overlap! dx=${dx}, dy=${dy}`
        );
      }
    }
  }

  const nodes = rawNodes.map((node) => {
    const { id, position, ...rest } = node;
    return {
      id,
      type: 'concept',
      position,
      data: rest,
    };
  });

  const edges = [];

  rawNodes.forEach((node) => {
    if (Array.isArray(node.prerequisites)) {
      node.prerequisites.forEach((prereqId) => {
        if (!nodeIds.has(prereqId)) {
          console.warn(
            `[Graph Warning] Edge source node ID "${prereqId}" does not exist in nodes list (Target node: "${node.id}")`
          );
        } else {
          const sourceNode = nodeMap.get(prereqId);
          const targetNode = node;

          let style = {};
          let animated = false;

          if (targetNode.status === 'locked') {
            style = {
              stroke: '#475569',
              strokeDasharray: '6,6',
              opacity: 0.35,
              strokeWidth: 1.5,
            };
          } else if (sourceNode.status === 'mastered') {
            style = {
              stroke: '#10b981',
              opacity: 0.85,
              strokeWidth: 2,
            };
          } else if (sourceNode.status === 'current' || sourceNode.status === 'learning') {
            style = {
              stroke: '#38bdf8',
              opacity: 0.85,
              strokeWidth: 2,
            };
            animated = true;
          } else if (sourceNode.status === 'struggling' || sourceNode.status === 'gap') {
            style = {
              stroke: sourceNode.status === 'gap' ? '#f87171' : '#f59e0b',
              opacity: 0.75,
              strokeWidth: 2,
            };
          } else {
            style = {
              stroke: '#64748b',
              opacity: 0.4,
              strokeWidth: 1.5,
            };
          }

          edges.push({
            id: `e-${prereqId}-${node.id}`,
            source: prereqId,
            target: node.id,
            style,
            animated,
          });
        }
      });
    }
  });

  return { nodes, edges };
}

// Adapter function for Person 1's contract shape:
// { student, nodes: [...], diagnostics: { gapDetected, currentNode, gapNode, path, evidence, recommendation } }
export function adaptPersonOneData(rawJson) {
  if (!rawJson || !Array.isArray(rawJson.nodes)) {
    console.error('[Adapter Error] Invalid Person 1 payload structure.', rawJson);
    return { nodes: [], edges: [], rawNodes: [], diagnostics: null, student: null };
  }

  const { nodes, edges } = mapNodesToFlow(rawJson.nodes);

  const diagnostics = rawJson.diagnostics
    ? {
        gapDetected: rawJson.diagnostics.gapDetected ?? true,
        currentNode: rawJson.diagnostics.currentNode || 'quadratic',
        gapNode: rawJson.diagnostics.gapNode || 'fractions',
        path: rawJson.diagnostics.path || [
          'quadratic',
          'linear-eq',
          'algebra',
          'ratios',
          'fractions',
        ],
        evidence: rawJson.diagnostics.evidence || [
          '6 failed attempts',
          'High time-to-mastery',
          'Failed prerequisite dependency',
        ],
        recommendation: rawJson.diagnostics.recommendation || 'Fraction Operations',
      }
    : null;

  return {
    student: rawJson.student || { name: 'Student', id: 'unknown' },
    rawNodes: rawJson.nodes,
    nodes,
    edges,
    diagnostics,
  };
}
