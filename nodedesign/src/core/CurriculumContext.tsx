import React, { createContext, useContext, useMemo, useReducer, useRef, useCallback } from "react";
import graphJson from "./curriculum_graph.json";
import {
  Graph,
  NodeId,
  Option,
  Progress,
  Diagnosis,
  emptyProgress,
  recomputeUnlocks,
  diagnoseGap,
  isMastered,
  readSignals,
  remediationQueue,
  toFlow,
} from "./graphLogic";

const graph = graphJson as unknown as Graph;

interface State {
  progress: Progress;
  activeNode: NodeId | null;
  diagnoses: Diagnosis[];   // newest first, drives the toast and the side panel
  answered: Record<string, string>; // questionId -> chosen option id
}

type Action =
  | { type: "ENTER_NODE"; nodeId: NodeId }
  | { type: "EXIT_NODE"; nodeId: NodeId; elapsedMs: number }
  | { type: "ANSWER"; nodeId: NodeId; questionId: string; option: Option }
  | { type: "TOGGLE_EXPAND"; nodeId: NodeId }
  | { type: "RESET" };

function initial(): State {
  return { progress: emptyProgress(graph), activeNode: null, diagnoses: [], answered: {} };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ENTER_NODE": {
      const cur = state.progress[action.nodeId];
      if (!cur || cur.status === "locked") return state;
      const progress: Progress = {
        ...state.progress,
        [action.nodeId]: {
          ...cur,
          firstSeenAt: cur.firstSeenAt ?? Date.now(),
          status: cur.status === "available" ? "in_progress" : cur.status,
        },
      };
      return { ...state, progress, activeNode: action.nodeId };
    }

    case "EXIT_NODE": {
      const cur = state.progress[action.nodeId];
      if (!cur) return state;
      return {
        ...state,
        activeNode: null,
        progress: {
          ...state.progress,
          [action.nodeId]: { ...cur, msOnNode: cur.msOnNode + action.elapsedMs },
        },
      };
    }

    case "ANSWER": {
      const { nodeId, questionId, option } = action;
      const cur = state.progress[nodeId];
      if (!cur) return state;

      let progress: Progress = {
        ...state.progress,
        [nodeId]: {
          ...cur,
          attempts: cur.attempts + 1,
          correct: cur.correct + (option.correct ? 1 : 0),
          wrong: cur.wrong + (option.correct ? 0 : 1),
        },
      };

      const diagnoses = [...state.diagnoses];

      if (!option.correct) {
        // The core move: trace the failure back through the prerequisite edges.
        const d = diagnoseGap(graph, nodeId, option, progress);
        diagnoses.unshift(d);

        const gap = progress[d.gapNode];
        progress = {
          ...progress,
          [d.gapNode]: {
            ...gap,
            status: gap.status === "mastered" ? "mastered" : "gap",
            gapReason: d.reason,
            blamedBy: nodeId,
            expanded: true,
          },
        };

        // Struggling on the node itself also unfolds its micro-steps.
        if (readSignals(progress[nodeId]).struggling) {
          progress = { ...progress, [nodeId]: { ...progress[nodeId], expanded: true } };
        }
      } else {
        if (isMastered(graph, nodeId, progress)) {
          progress = {
            ...progress,
            [nodeId]: {
              ...progress[nodeId],
              status: "mastered",
              masteredAt: Date.now(),
              gapReason: null,
              // Excelling compresses the node back down to a chip.
              expanded: readSignals(progress[nodeId]).excelling ? false : progress[nodeId].expanded,
            },
          };
        }
      }

      return {
        ...state,
        progress: recomputeUnlocks(graph, progress),
        diagnoses,
        answered: { ...state.answered, [questionId]: option.id },
      };
    }

    case "TOGGLE_EXPAND": {
      const cur = state.progress[action.nodeId];
      if (!cur) return state;
      return {
        ...state,
        progress: { ...state.progress, [action.nodeId]: { ...cur, expanded: !cur.expanded } },
      };
    }

    case "RESET":
      return initial();

    default:
      return state;
  }
}

interface Ctx extends State {
  graph: Graph;
  flow: ReturnType<typeof toFlow>;
  queue: NodeId[];
  latestDiagnosis: Diagnosis | null;
  enterNode: (id: NodeId) => void;
  exitNode: () => void;
  answer: (nodeId: NodeId, questionId: string, option: Option) => void;
  toggleExpand: (id: NodeId) => void;
  reset: () => void;
}

const CurriculumContext = createContext<Ctx | null>(null);

export function CurriculumProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  const enteredAt = useRef<number>(0);

  const enterNode = useCallback((id: NodeId) => {
    enteredAt.current = Date.now();
    dispatch({ type: "ENTER_NODE", nodeId: id });
  }, []);

  const exitNode = useCallback(() => {
    if (!state.activeNode) return;
    dispatch({ type: "EXIT_NODE", nodeId: state.activeNode, elapsedMs: Date.now() - enteredAt.current });
  }, [state.activeNode]);

  const answer = useCallback((nodeId: NodeId, questionId: string, option: Option) => {
    dispatch({ type: "ANSWER", nodeId, questionId, option });
  }, []);

  const toggleExpand = useCallback((id: NodeId) => dispatch({ type: "TOGGLE_EXPAND", nodeId: id }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      graph,
      flow: toFlow(graph, state.progress),
      queue: remediationQueue(graph, state.progress),
      latestDiagnosis: state.diagnoses[0] ?? null,
      enterNode,
      exitNode,
      answer,
      toggleExpand,
      reset,
    }),
    [state, enterNode, exitNode, answer, toggleExpand, reset]
  );

  return <CurriculumContext.Provider value={value}>{children}</CurriculumContext.Provider>;
}

export function useCurriculum(): Ctx {
  const ctx = useContext(CurriculumContext);
  if (!ctx) throw new Error("useCurriculum must be used inside CurriculumProvider");
  return ctx;
}

/** Convenience hook for a single node panel. */
export function useNode(id: NodeId) {
  const { graph: g, progress, answered, answer } = useCurriculum();
  const node = g.nodes.find((n) => n.id === id) ?? null;
  return {
    node,
    questions: g.questions[id] ?? [],
    progress: progress[id],
    answered,
    answer: (questionId: string, option: Option) => answer(id, questionId, option),
    signals: readSignals(progress[id]),
  };
}
