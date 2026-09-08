"use client";

import { useEffect, useRef, useState } from "react";
import SlideScreen from "@/components/ui/SlideScreen";
import ThumbDragSort from "@/components/ui/ThumbDragSort";
import type { Ratings } from "@/lib/matching";
import { SUGGESTIONS } from "@/lib/suggestions";

type TaskSurveyProps = {
  onComplete: (
    pRes: Ratings,
    pStrongRec: [number, number] | null,
    pWeakRec: [number, number] | null,
  ) => void;
  // true while onComplete's /api/task POST is in flight.
  submitting?: boolean;
  // navigates to the previous route (task-brief). Only used on subPage 0 —
  // later subpages go back within the component instead.
  onBack: () => void;
};

const ALL_REC_IDS = SUGGESTIONS.map((s) => s.recId);
const SUGGESTION_BY_ID = new Map(SUGGESTIONS.map((s) => [s.recId, s]));

// task.p_strong_rec / p_weak_rec are stored as (optionally null) length-2
// arrays. With 2 genuine ids on a side, store both. With exactly 1 (agreed
// or disagreed with 9 of the 10 statements), duplicate it into both slots
// rather than inventing an unrelated second id — every consumer only checks
// membership (.includes), so a repeated id is a no-op, not a fabricated
// pick. With 0, there's no genuine pick at all — store null.
function pickTwoOrNull(preferred: number[]): [number, number] | null {
  if (preferred.length === 0) return null;
  if (preferred.length === 1) return [preferred[0], preferred[0]];
  return [preferred[0], preferred[1]];
}

export default function TaskSurvey({ onComplete, submitting = false, onBack }: TaskSurveyProps) {
  const [subPage, setSubPage] = useState(0);
  const [ratings, setRatings] = useState<Ratings>({});
  const [order, setOrder] = useState<number[]>([]);
  const [strong, setStrong] = useState<number[]>([]);
  const [weak, setWeak] = useState<number[]>([]);

  const allRated = ALL_REC_IDS.every((id) => ratings[id] !== undefined);
  const dragContinueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allRated) {
      dragContinueRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [allRated]);
  // Recency-first (most-recently-sorted first), matching the order the
  // participant just saw in the thumbs-up/down piles while sorting, so the
  // strongest/weakest review steps don't reshuffle the list.
  const agreeIds = [...order].reverse().filter((id) => ratings[id] === true);
  const disagreeIds = [...order].reverse().filter((id) => ratings[id] === false);
  // 2 or fewer items on a side means there's nothing meaningful to rank —
  // either there's no choice to make (exactly 2 = the top/bottom 2 already)
  // or not enough to fill the requirement. Skip that pick step and auto-fill
  // it. Both can't be true at once since agree + disagree always add up to
  // all 10 suggestions.
  const skipStrongPick = allRated && agreeIds.length <= 2;
  const skipWeakPick = allRated && disagreeIds.length <= 2;

  const strongValid = strong.length === 2;
  const weakValid = weak.length === 2;

  // subPage: 0 = instructions, 1 = drag-sort rating (one suggestion at a
  // time, dragged into a pile), 2 = pick strongest, 3 = pick weakest.
  // Strong/weak pages collapse via skip*Pick, same as before.
  const strongPage = 2;
  const weakPage = skipStrongPick ? 2 : 3;

  function toggleStrong(recId: number) {
    setStrong((prev) => {
      if (prev.includes(recId)) return prev.filter((id) => id !== recId);
      if (prev.length >= 2) return prev;
      return [...prev, recId];
    });
  }

  function toggleWeak(recId: number) {
    setWeak((prev) => {
      if (prev.includes(recId)) return prev.filter((id) => id !== recId);
      if (prev.length >= 2) return prev;
      return [...prev, recId];
    });
  }

  if (subPage === 0) {
    return (
      <SlideScreen
        align="left"
        innerClassName="rate-legend-centered"
        lines={["For each suggestion that you read, please indicate your evaluation:"]}
        onBack={onBack}
        onContinue={() => setSubPage(1)}
        continueLabel="Continue"
      >
        <ul className="rate-legend">
          <li className="rate-legend-up">
            <span className="rate-legend-icon">👍</span>
            <span className="rate-legend-body">
              <span className="rate-legend-label">Agree</span>
              <span>
                You think this is a good suggestion. It is a worthwhile idea that could
                meaningfully improve virtual meetings.
              </span>
            </span>
          </li>
          <li className="rate-legend-down">
            <span className="rate-legend-icon">👎</span>
            <span className="rate-legend-body">
              <span className="rate-legend-label">Disagree</span>
              <span>
                You think this is a weak suggestion. It is not a particularly useful or realistic
                idea for improving virtual meetings.
              </span>
            </span>
          </li>
        </ul>
      </SlideScreen>
    );
  }

  if (subPage === 1) {
    return (
      <div className="screen screen-slide">
        <div className="slide-inner align-left">
          <h1 className="slide-title" style={{marginBottom: 32 }}>
            Rate each suggestion
          </h1>
          <p className="slide-text" style={{ textAlign: "left", marginBottom: 20 }}>
              Drag and drop each suggestion below into the Agree or Disagree bin.
          </p>
          <ThumbDragSort
            items={SUGGESTIONS}
            ratings={ratings}
            onRate={(recId, value) => setRatings((r) => ({ ...r, [recId]: value }))}
            onUnrate={(recId) =>
              setRatings((r) => {
                const next = { ...r };
                delete next[recId];
                return next;
              })
            }
            order={order}
            onOrderChange={setOrder}
          />
          <div className="slide-nav" ref={dragContinueRef}>
            <button
              type="button"
              className="btn btn-accent btn-lg"
              onClick={() => setSubPage(strongPage)}
              disabled={!allRated}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (subPage === strongPage && !skipStrongPick) {
    return (
      <div className="screen screen-slide">
        <div className="slide-inner align-left">
          <p className="slide-text" style={{ marginBottom: 48 }}>
            You gave the following suggestions a thumbs up. Which two do you think are the
            strongest? (Select two suggestions).    
          </p>
          <div className="pick-list">
            {agreeIds.map((id) => SUGGESTION_BY_ID.get(id)!).map((s) => {
              const sel = strong.includes(s.recId);
              const disabled = !sel && strong.length >= 2;
              return (
                <div
                  className={`pick-card ${sel ? "sel" : ""} ${disabled ? "disabled" : ""}`}
                  key={s.recId}
                  onClick={() => !disabled && toggleStrong(s.recId)}
                >
                  <div className="pick-check">{sel ? "✓" : ""}</div>
                  <span className="pick-text">{s.text}</span>
                </div>
              );
            })}
          </div>
          <div className="slide-nav">
            <button
              type="button"
              className="btn btn-accent btn-lg"
              onClick={() => {
                if (skipWeakPick) {
                  onComplete(ratings, [strong[0], strong[1]], pickTwoOrNull(disagreeIds));
                } else {
                  setSubPage(weakPage);
                }
              }}
              disabled={!strongValid || (skipWeakPick && submitting)}
            >
              {skipWeakPick ? (submitting ? "Saving…" : "Continue") : "Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-slide">
      <div className="slide-inner align-left">
        <p className="slide-text" style={{ marginBottom: 48 }}>
          You gave the following suggestions a thumbs down. Which two do you think are the
          weakest? (Select two suggestions).
        </p>
        <div className="pick-list">
          {disagreeIds.map((id) => SUGGESTION_BY_ID.get(id)!).map((s) => {
            const sel = weak.includes(s.recId);
            const disabled = !sel && weak.length >= 2;
            return (
              <div
                className={`pick-card ${sel ? "sel" : ""} ${disabled ? "disabled" : ""}`}
                key={s.recId}
                onClick={() => !disabled && toggleWeak(s.recId)}
              >
                <div className="pick-check">{sel ? "✓" : ""}</div>
                <span className="pick-text">{s.text}</span>
              </div>
            );
          })}
        </div>
        <div className="slide-nav">
          <button
            type="button"
            className="btn btn-accent btn-lg"
            onClick={() => {
              if (skipStrongPick) {
                onComplete(ratings, pickTwoOrNull(agreeIds), [weak[0], weak[1]]);
              } else {
                onComplete(ratings, [strong[0], strong[1]], [weak[0], weak[1]]);
              }
            }}
            disabled={!weakValid || submitting}
          >
            {submitting ? "Saving…" : "See the results"}
          </button>
        </div>
      </div>
    </div>
  );
}
