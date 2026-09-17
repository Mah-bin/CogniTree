export type NodeStatus = 'locked' | 'unlocked' | 'mastered' | 'gap' | 'detour';

export interface ConceptNode {
  id: string;
  title: string;
  status: NodeStatus;
  position: { x: number; y: number };
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  misconceptionNodeId: string | null;
}

export interface Question {
  id: string;
  nodeId: string;
  text: string;
  options: Option[];
}

export interface AppState {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  questions: Question[];
}

export interface AnswerResult {
  newState: AppState;
  diagnosticMessage: string | null;
}

/**
 * The Brain of CogniTree.
 * Evaluates an answer and updates the spatial graph state accordingly.
 */
export function handleAnswer(
  currentState: AppState,
  nodeId: string,
  selectedOptionId: string
): AnswerResult {
  // 1. Deep clone state to avoid mutating React state directly
  const newState: AppState = JSON.parse(JSON.stringify(currentState));
  
  // 2. Find the question and the selected option
  const question = newState.questions.find(q => q.nodeId === nodeId);
  if (!question) throw new Error("Question not found for node");
  
  const selectedOption = question.options.find(o => o.id === selectedOptionId);
  if (!selectedOption) throw new Error("Option not found");

  const targetNode = newState.nodes.find(n => n.id === nodeId);
  if (!targetNode) throw new Error("Node not found");

  let diagnosticMessage = null;

  // 3. LOGIC ROUTING
  if (selectedOption.isCorrect) {
    // PASS: Mark current node as mastered
    targetNode.status = 'mastered';
    
    // Unlock immediate downstream nodes
    const outgoingEdges = newState.edges.filter(e => e.source === nodeId);
    outgoingEdges.forEach(edge => {
      const downstreamNode = newState.nodes.find(n => n.id === edge.target);
      if (downstreamNode && downstreamNode.status === 'locked') {
        downstreamNode.status = 'unlocked';
      }
    });

    diagnosticMessage = "Correct! You've mastered this concept.";
  } else {
    // FAIL: Check for misconception
    if (selectedOption.misconceptionNodeId) {
      // We found a specific upstream gap!
      const upstreamNode = newState.nodes.find(n => n.id === selectedOption.misconceptionNodeId);
      if (upstreamNode) {
        // Change the upstream node to a 'gap' (turns red on the UI)
        upstreamNode.status = 'gap';
        diagnosticMessage = `Misconception Detected! It looks like you're struggling with ${upstreamNode.title}. Let's review that first.`;
      }
    } else {
      // Standard fail, no specific gap
      diagnosticMessage = "Not quite right. Try reviewing this concept again.";
    }
  }

  return {
    newState,
    diagnosticMessage
  };
}
