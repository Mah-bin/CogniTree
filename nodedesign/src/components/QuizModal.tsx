import React, { useEffect, useMemo, useState } from "react";
import { useCurriculum } from "../core/CurriculumContext";
import type { NodeId, Option, Question } from "../core/graphLogic";
import "../styles/QuizModal.css";

interface QuizModalProps {
  nodeId: NodeId;
  onClose: () => void;
}

/**
 * Reusable quiz modal for a single concept node.
 * Pulls its question(s) from the existing curriculum graph/context and
 * routes every answer through CurriculumContext's answer() reducer action.
 * Holds no diagnosis/mastery logic of its own.
 */
export default function QuizModal({ nodeId, onClose }: QuizModalProps) {
  const { graph, progress, answered, latestDiagnosis, answer } = useCurriculum();

  const node = useMemo(() => graph.nodes.find((n) => n.id === nodeId) ?? null, [graph, nodeId]);
  const questions: Question[] = graph.questions[nodeId] ?? [];
  const nodeProgress = progress[nodeId];

  // Walk to the first not-yet-answered question for this node, defaulting to the first.
  const startIndex = Math.max(
    0,
    questions.findIndex((q) => !(q.id in answered))
  );
  const [qIndex, setQIndex] = useState(startIndex === -1 ? 0 : startIndex);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lastOption, setLastOption] = useState<Option | null>(null);

  const question = questions[qIndex] ?? null;

  // Reset local answer state whenever we move to a different question or node.
  useEffect(() => {
    setSelectedId(null);
    setSubmitted(false);
    setLastOption(null);
  }, [nodeId, qIndex]);

  if (!node) return null;

  const handleCheck = () => {
    if (!question || !selectedId) return;
    const chosen = question.options.find((o) => o.id === selectedId) ?? null;
    if (!chosen) return;
    answer(nodeId, question.id, chosen);
    setLastOption(chosen);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      onClose();
    }
  };

  const isLastQuestion = qIndex >= questions.length - 1;
  const gapNode =
    lastOption && !lastOption.correct && latestDiagnosis?.failedNode === nodeId
      ? latestDiagnosis
      : null;
  const gapNodeTitle = gapNode
    ? graph.nodes.find((n) => n.id === gapNode.gapNode)?.title ?? gapNode.gapNode
    : null;

  return (
    <div className="quiz-modal-overlay" role="dialog" aria-modal="true" aria-label={`Quiz: ${node.title}`}>
      <div className="quiz-modal">
        <button className="quiz-modal__close" onClick={onClose} aria-label="Close quiz">
          &times;
        </button>

        <div className="quiz-modal__header">
          <span className="quiz-modal__eyebrow">{node.title}</span>
          <h2 className="quiz-modal__title">{node.short}</h2>
          {questions.length > 1 && (
            <span className="quiz-modal__progress">
              Question {qIndex + 1} of {questions.length}
            </span>
          )}
        </div>

        {!question ? (
          <p className="quiz-modal__empty">No questions are available for this concept yet.</p>
        ) : (
          <>
            <p className="quiz-modal__stem">{question.stem}</p>

            <div className="quiz-modal__options">
              {question.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const showResult = submitted && lastOption;
                let stateClass = "";
                if (showResult) {
                  if (opt.id === lastOption?.id && opt.correct) stateClass = "is-correct";
                  else if (opt.id === lastOption?.id && !opt.correct) stateClass = "is-incorrect";
                  else if (opt.correct) stateClass = "is-correct-muted";
                }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`quiz-option ${isSelected ? "is-selected" : ""} ${stateClass}`}
                    onClick={() => !submitted && setSelectedId(opt.id)}
                    disabled={submitted}
                  >
                    <span className="quiz-option__marker" aria-hidden="true" />
                    <span className="quiz-option__text">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {!submitted ? (
              <button
                className="quiz-modal__cta"
                onClick={handleCheck}
                disabled={!selectedId}
              >
                Check Answer
              </button>
            ) : (
              <div className={`quiz-feedback ${lastOption?.correct ? "is-correct" : "is-incorrect"}`}>
                <p className="quiz-feedback__headline">
                  {lastOption?.correct ? "Nice work — that's correct!" : "Not quite."}
                </p>

                {!lastOption?.correct && (
                  <p className="quiz-feedback__reason">
                    {gapNode?.reason ?? "Let's revisit the concept behind this one."}
                    {gapNodeTitle && gapNode?.gapNode !== nodeId && (
                      <>
                        {" "}
                        This traces back to <strong>{gapNodeTitle}</strong>.
                      </>
                    )}
                  </p>
                )}

                {nodeProgress?.status === "mastered" && (
                  <p className="quiz-feedback__mastered">You've mastered {node.title}. 🎉</p>
                )}

                <button className="quiz-modal__cta" onClick={handleNext}>
                  {isLastQuestion ? "Done" : "Next Question"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}