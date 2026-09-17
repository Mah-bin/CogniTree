/**
 * CogniTree core logic. Pure functions only, no React, no side effects.
 * Every function takes the graph plus the current progress map and returns new data.
 */

export type NodeId = string;

export type Status = "locked" | "available" | "in_progress" | "gap" | "mastered";

export interface CurriculumNode {
  id: NodeId;
  title: string;
  short: string;
  prereqs: NodeId[];
  position: { x: number; y: number };
  microSteps: { id: string; title: string; prompt: string }[];
}

export interface Option {
  id: string;
  text: string;
  correct: boolean;
  blame: NodeId | null;
  reason?: string;
}

export interface Question {
  id: string;
  stem: string;
  options: Option[];
}

export interface Graph {
  meta: { id: string; title: string; version: number; masteryThreshold: number; description: string };
  nodes: CurriculumNode[];
  questions: Record<NodeId, Question[]>;
}

export interface NodeProgress {
  status: Status;
  attempts: number;
  wrong: number;
  correct: number;
  msOnNode: number;
  firstSeenAt: number | null;
  masteredAt: number | null;
  expanded: boolean;          // micro-steps injected after struggle
  gapReason: string | null;   // why this node was flagged
  blamedBy: NodeId | null;    // which downstream failure exposed it
}

export type Progress = Record<NodeId, NodeProgress>;

export interface Diagnosis {
  failedNode: NodeId;
  gapNode: NodeId;
  path: NodeId[];               // failedNode -> ... -> gapNode
  reason: string;
  method: "distractor" | "traversal" | "self";
}

/* ------------------------------------------------------------------ */
/* Indexing                                                            */
/* ------------------------------------------------------------------ */

export function indexNodes(graph: Graph): Record<NodeId, CurriculumNode> {
  return Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
}

/** Children map: parent id -> ids that depend on it. Useful for unlocking. */
export function buildDependents(graph: Graph): Record<NodeId, NodeId[]> {
  const out: Record<NodeId, NodeId[]> = {};
  for (const n of graph.nodes) out[n.id] = [];
  for (const n of graph.nodes) {
    for (const p of n.prereqs) {
      if (out[p]) out[p].push(n.id);
    }
  }
  return out;
}

export function getPrereqs(graph: Graph, id: NodeId): NodeId[] {
  return indexNodes(graph)[id]?.prereqs ?? [];
}

/* ------------------------------------------------------------------ */
/* Reverse traversal                                                   */
/* ------------------------------------------------------------------ */

/**
 * Breadth first walk backwards through prerequisite edges.
 * Returns ancestors in order of increasing distance from the start node.
 * Cycle safe, so a badly authored graph will not hang the demo.
 */
export function reverseTraverse(graph: Graph, start: NodeId, maxDepth = 6): NodeId[] {
  const nodes = indexNodes(graph);
  const seen = new Set<NodeId>([start]);
  const order: NodeId[] = [];
  let frontier = [start];
  let depth = 0;

  while (frontier.length && depth < maxDepth) {
    const next: NodeId[] = [];
    for (const id of frontier) {
      for (const p of nodes[id]?.prereqs ?? []) {
        if (seen.has(p)) continue;
        seen.add(p);
        order.push(p);
        next.push(p);
      }
    }
    frontier = next;
    depth += 1;
  }
  return order;
}

/** Shortest prerequisite chain from a node down to one of its ancestors. */
export function pathToAncestor(graph: Graph, from: NodeId, to: NodeId): NodeId[] {
  const nodes = indexNodes(graph);
  const parent: Record<NodeId, NodeId | null> = { [from]: null };
  const queue = [from];

  while (queue.length) {
    const id = queue.shift() as NodeId;
    if (id === to) {
      const path: NodeId[] = [];
      let cur: NodeId | null = id;
      while (cur) {
        path.unshift(cur);
        cur = parent[cur];
      }
      return path;
    }
    for (const p of nodes[id]?.prereqs ?? []) {
      if (!(p in parent)) {
        parent[p] = id;
        queue.push(p);
      }
    }
  }
  return [from];
}

/**
 * The headline feature. Given a wrong answer on a node, decide which upstream
 * concept is actually broken.
 *
 * Priority order:
 *  1. The distractor was authored with a blame target, so trust the author.
 *  2. Otherwise walk backwards and pick the nearest ancestor that is not mastered.
 *  3. Otherwise the node itself is the gap, since its foundations are solid.
 */
export function diagnoseGap(
  graph: Graph,
  failedNode: NodeId,
  chosen: Option | null,
  progress: Progress
): Diagnosis {
  if (chosen?.blame && chosen.blame !== failedNode) {
    return {
      failedNode,
      gapNode: chosen.blame,
      path: pathToAncestor(graph, failedNode, chosen.blame),
      reason: chosen.reason ?? "This answer pattern points at an earlier concept.",
      method: "distractor",
    };
  }

  const ancestors = reverseTraverse(graph, failedNode);
  const weak = ancestors.find((id) => progress[id]?.status !== "mastered");
  if (weak) {
    return {
      failedNode,
      gapNode: weak,
      path: pathToAncestor(graph, failedNode, weak),
      reason: "The nearest unfinished prerequisite is the likely blocker.",
      method: "traversal",
    };
  }

  return {
    failedNode,
    gapNode: failedNode,
    path: [failedNode],
    reason: chosen?.reason ?? "Foundations look solid, so the difficulty sits in this concept itself.",
    method: "self",
  };
}

/* ------------------------------------------------------------------ */
/* Status and unlocking                                                */
/* ------------------------------------------------------------------ */

export function emptyProgress(graph: Graph): Progress {
  const p: Progress = {};
  for (const n of graph.nodes) {
    p[n.id] = {
      status: n.prereqs.length === 0 ? "available" : "locked",
      attempts: 0,
      wrong: 0,
      correct: 0,
      msOnNode: 0,
      firstSeenAt: null,
      masteredAt: null,
      expanded: false,
      gapReason: null,
      blamedBy: null,
    };
  }
  return p;
}

/**
 * Recompute locked vs available after any change. Gap and mastered are sticky,
 * they are set by the reducer rather than derived here.
 */
export function recomputeUnlocks(graph: Graph, progress: Progress): Progress {
  const next: Progress = { ...progress };
  for (const n of graph.nodes) {
    const cur = next[n.id];
    if (!cur || cur.status === "mastered" || cur.status === "gap" || cur.status === "in_progress") continue;
    const ready = n.prereqs.every((p) => next[p]?.status === "mastered");
    next[n.id] = { ...cur, status: ready ? "available" : "locked" };
  }
  return next;
}

/** 
 * Mastery requires correctness AND fluency. 
 * If a student is struggling or guessing slowly, they do not get mastery.
 */
export function isMastered(graph: Graph, id: NodeId, progress: Progress): boolean {
  const total = graph.questions[id]?.length ?? 0;
  const p = progress[id];
  if (!p) return false;
  
  const hasEnoughCorrect = total > 0 && p.correct >= total;
  if (!hasEnoughCorrect) return false;

  const signals = readSignals(p);
  
  // MASTERY PENALTY FIX:
  // If they are explicitly struggling, or taking too long (guessing/lack of fluency),
  // they remain in "in_progress" state so the judge can see we track fluency.
  if (signals.struggling || signals.secondsPerAttempt > 45) {
    return false;
  }

  return true;
}

/* ------------------------------------------------------------------ */
/* Behavioral telemetry                                                */
/* ------------------------------------------------------------------ */

export interface Signals {
  struggling: boolean;
  excelling: boolean;
  accuracy: number;
  secondsPerAttempt: number;
}

/**
 * Drives the expand and compress behaviour in the UI.
 * Struggling means micro-steps get injected under the node.
 * Excelling means the node collapses to a single summary chip.
 */
export function readSignals(p: NodeProgress | undefined): Signals {
  if (!p || p.attempts === 0) {
    return { struggling: false, excelling: false, accuracy: 0, secondsPerAttempt: 0 };
  }
  const accuracy = p.correct / p.attempts;
  const secondsPerAttempt = p.msOnNode / p.attempts / 1000;
  return {
    struggling: p.wrong >= 2 || (accuracy < 0.5 && p.attempts >= 2),
    excelling: p.wrong === 0 && accuracy === 1 && secondsPerAttempt < 20,
    accuracy,
    secondsPerAttempt,
  };
}

/** Ordered remediation queue for the "what next" panel. */
export function remediationQueue(graph: Graph, progress: Progress): NodeId[] {
  return graph.nodes
    .filter((n) => progress[n.id]?.status === "gap")
    .sort((a, b) => reverseTraverse(graph, b.id).length - reverseTraverse(graph, a.id).length)
    .map((n) => n.id);
}

/** React Flow consumes this directly. */
export function toFlow(graph: Graph, progress: Progress) {
  const nodes = graph.nodes.map((n) => ({
    id: n.id,
    position: n.position,
    data: {
      label: n.title,
      short: n.short,
      status: progress[n.id]?.status ?? "locked",
      expanded: progress[n.id]?.expanded ?? false,
      gapReason: progress[n.id]?.gapReason ?? null,
      microSteps: n.microSteps,
    },
    type: "concept",
  }));

  const edges = graph.nodes.flatMap((n) =>
    n.prereqs.map((p) => ({
      id: `${p}->${n.id}`,
      source: p,
      target: n.id,
      animated: progress[p]?.status === "gap",
    }))
  );

  return { nodes, edges };
}
