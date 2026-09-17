import React, { useMemo } from "react";
import { useCurriculum } from "../core/CurriculumContext";
import { readSignals } from "../core/graphLogic";
// Suppress missing type declarations for CSS side-effect import
// @ts-ignore
import "../styles/AnalyticsDashboard.css";

interface AnalyticsDashboardProps {
  onClose?: () => void;
  onSelectNode?: (nodeId: string) => void;
}

/**
 * Final strengths & weaknesses dashboard.
 * Reads everything from CurriculumContext — no invented statistics,
 * no re-implementation of mastery/gap/diagnosis logic.
 */
export default function AnalyticsDashboard({ onClose, onSelectNode }: AnalyticsDashboardProps) {
  const { graph, progress, queue, latestDiagnosis } = useCurriculum();

  const rows = useMemo(
    () =>
      graph.nodes.map((n) => {
        const p = progress[n.id];
        const signals = readSignals(p);
        return { node: n, progress: p, signals };
      }),
    [graph, progress]
  );

  const mastered = rows.filter((r) => r.progress?.status === "mastered");
  const gaps = rows.filter((r) => r.progress?.status === "gap");
  const inProgress = rows.filter(
    (r) => r.progress?.status === "in_progress" || r.progress?.status === "available"
  );
  const attemptedRows = rows.filter((r) => (r.progress?.attempts ?? 0) > 0);

  const totalAttempts = attemptedRows.reduce((sum, r) => sum + (r.progress?.attempts ?? 0), 0);
  const totalCorrect = attemptedRows.reduce((sum, r) => sum + (r.progress?.correct ?? 0), 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;

  const recommendedId = queue[0] ?? inProgress.find((r) => r.progress?.status === "available")?.node.id ?? null;
  const recommended = recommendedId ? graph.nodes.find((n) => n.id === recommendedId) ?? null : null;

  const hasAnyActivity = attemptedRows.length > 0;

  return (
    <div className="dash">
      <div className="dash__header">
        <div>
          <span className="dash__eyebrow">Your Progress</span>
          <h1 className="dash__title">Strengths &amp; Weaknesses</h1>
        </div>
        {onClose && (
          <button className="dash__close" onClick={onClose} aria-label="Close dashboard">
            &times;
          </button>
        )}
      </div>

      {!hasAnyActivity ? (
        <p className="dash__empty">
          No quiz attempts yet — answer a few questions on the map to see your progress here.
        </p>
      ) : (
        <>
          <div className="dash__summary">
            <div className="dash__stat">
              <span className="dash__stat-value">{mastered.length}</span>
              <span className="dash__stat-label">Concepts mastered</span>
            </div>
            <div className="dash__stat">
              <span className="dash__stat-value">{gaps.length}</span>
              <span className="dash__stat-label">Gaps identified</span>
            </div>
            <div className="dash__stat">
              <span className="dash__stat-value">{overallAccuracy !== null ? `${overallAccuracy}%` : "—"}</span>
              <span className="dash__stat-label">Overall accuracy</span>
            </div>
            <div className="dash__stat">
              <span className="dash__stat-value">{totalAttempts}</span>
              <span className="dash__stat-label">Questions attempted</span>
            </div>
          </div>

          {latestDiagnosis && (
            <section className="dash__callout">
              <span className="dash__callout-label">Latest identified knowledge gap</span>
              <p className="dash__callout-text">
                Struggling with <strong>{graph.nodes.find((n) => n.id === latestDiagnosis.failedNode)?.title}</strong>{" "}
                traced back to{" "}
                <strong>{graph.nodes.find((n) => n.id === latestDiagnosis.gapNode)?.title}</strong>.
              </p>
              <p className="dash__callout-reason">{latestDiagnosis.reason}</p>
            </section>
          )}

          {recommended && (
            <section className="dash__callout dash__callout--recommend">
              <span className="dash__callout-label">Recommended next</span>
              <p className="dash__callout-text">
                Focus on <strong>{recommended.title}</strong> — {recommended.short}
              </p>
              {onSelectNode && (
                <button className="dash__cta" onClick={() => onSelectNode(recommended.id)}>
                  Practice this concept
                </button>
              )}
            </section>
          )}

          <div className="dash__columns">
            <section className="dash__panel">
              <h2 className="dash__panel-title dash__panel-title--strength">Strengths</h2>
              {mastered.length === 0 ? (
                <p className="dash__panel-empty">No concepts mastered yet — keep going!</p>
              ) : (
                <ul className="dash__list">
                  {mastered.map(({ node, progress: p }) => (
                    <li key={node.id} className="dash__item">
                      <div className="dash__item-row">
                        <span className="dash__item-title">{node.title}</span>
                        <span className="dash__item-badge dash__item-badge--strength">Mastered</span>
                      </div>
                      {p && p.attempts > 0 && (
                        <div className="dash__bar">
                          <div
                            className="dash__bar-fill dash__bar-fill--strength"
                            style={{ width: `${Math.round((p.correct / p.attempts) * 100)}%` }}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="dash__panel">
              <h2 className="dash__panel-title dash__panel-title--weakness">Weaknesses</h2>
              {gaps.length === 0 ? (
                <p className="dash__panel-empty">No open gaps right now.</p>
              ) : (
                <ul className="dash__list">
                  {gaps.map(({ node, progress: p }) => (
                    <li key={node.id} className="dash__item">
                      <div className="dash__item-row">
                        <span className="dash__item-title">{node.title}</span>
                        <span className="dash__item-badge dash__item-badge--weakness">Gap</span>
                      </div>
                      {p?.gapReason && <p className="dash__item-reason">{p.gapReason}</p>}
                      {p && p.attempts > 0 && (
                        <div className="dash__bar">
                          <div
                            className="dash__bar-fill dash__bar-fill--weakness"
                            style={{ width: `${Math.round((p.correct / p.attempts) * 100)}%` }}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {inProgress.length > 0 && (
            <section className="dash__panel dash__panel--wide">
              <h2 className="dash__panel-title">Still in progress</h2>
              <ul className="dash__list dash__list--row">
                {inProgress.map(({ node, progress: p }) => (
                  <li key={node.id} className="dash__chip">
                    {node.title}
                    {p && p.attempts > 0 && (
                      <span className="dash__chip-accuracy">
                        {" "}
                        · {Math.round((p.correct / p.attempts) * 100)}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}