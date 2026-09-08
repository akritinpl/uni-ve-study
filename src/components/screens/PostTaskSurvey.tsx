"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import NoticeModal from "@/components/ui/NoticeModal";
import SlideScreen from "@/components/ui/SlideScreen";
import { CONSULTANTS, CONSULTANT_META, type ConsultantName } from "@/lib/consultants";
import type { TimeAllocation } from "@/lib/types";

export type PostTaskAnswers = {
  refinedRec: string;
  frustration: string;
  wouldChange: string;
  timeC: TimeAllocation;
};

type PostTaskSurveyProps = {
  onComplete: (answers: PostTaskAnswers) => void;
  // true while onComplete's POSTs are in flight.
  submitting?: boolean;
  // what the participant wrote on the pre-task screen, shown back to them
  // here so they can expand or revise it now that they've seen the task.
  preTaskChange: string;
  // navigates to the previous route (post-review). Only used on subPage 0 —
  // subPage 1 goes back to subPage 0 instead.
  onBack: () => void;
};

const ZERO_TIME: TimeAllocation = Object.fromEntries(CONSULTANTS.map((name) => [name, 0])) as TimeAllocation;

export default function PostTaskSurvey({
  onComplete,
  submitting = false,
  preTaskChange,
  onBack,
}: PostTaskSurveyProps) {
  const [subPage, setSubPage] = useState(0);
  const [refinedRec, setRefinedRec] = useState("");
  const [frustration, setFrustration] = useState("");
  const [wouldChange, setWouldChange] = useState("");
  const [timeC, setTimeC] = useState<TimeAllocation>(ZERO_TIME);
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(false);
  const [showTimeNotice, setShowTimeNotice] = useState(false);
  const [showExceedNotice, setShowExceedNotice] = useState(false);
  // Raw text of whichever time field is currently being typed into — kept
  // separate from timeC so an in-progress decimal like "3." isn't collapsed
  // back to "3" by the numeric state on every keystroke.
  const [editingTime, setEditingTime] = useState<{ name: ConsultantName; text: string } | null>(null);

  const total = Math.round(CONSULTANTS.reduce((sum, name) => sum + (timeC[name] || 0), 0) * 100) / 100;
  const timeValid = Math.abs(total - 30) < 0.01;
  const questionsValid =
    refinedRec.trim() !== "" && frustration.trim() !== "" && wouldChange.trim() !== "";

  useEffect(() => {
    if (!showExceedNotice) return;
    const timer = setTimeout(() => setShowExceedNotice(false), 3000);
    return () => clearTimeout(timer);
  }, [showExceedNotice]);

  function setTime(name: ConsultantName, value: number) {
    // Not clamped to 30 here — a value over 30 is left as-is so the error
    // state (per-field warning + blocked continue) can actually show up
    // instead of being silently corrected.
    const clamped = Math.max(0, value);
    setTimeC((prev) => {
      const others = CONSULTANTS.filter((n) => n !== name);
      const next = { ...prev, [name]: clamped };
      // Auto-fill the remaining consultants with the leftover time, split
      // evenly, so the total always stays at 30 unless the participant
      // edits one of them afterward.
      const remainder = 30 - clamped;
      const share = Math.max(0, remainder) / others.length;
      others.forEach((n) => {
        next[n] = Math.round(share * 100) / 100;
      });
      return next;
    });
  }

  if (subPage === 0) {
    return (
      <>
        <SlideScreen
          align="left"
          lines={[]}
          onBack={onBack}
          continueMuted={!questionsValid}
          onContinue={() => {
            if (!questionsValid) {
              setShowIncompleteNotice(true);
              return;
            }
            setSubPage(1);
          }}
        >
          <div className="slide-q-group">
            <p className="slide-q">
              Now that you&rsquo;ve seen the consultants&rsquo; suggestions, how would you refine,
              expand, or add to your own recommendation for improving virtual
              meetings?<span className="req">*</span>
            </p>
            <textarea
              className="slide-textarea"
              value={refinedRec}
              onChange={(e) => setRefinedRec(e.target.value)}
            />
          </div>
          <div className="slide-q-group">
            <p className="slide-q">
              What is one thing that frustrates you about virtual meetings? That is, what do you
              think DOES NOT work well?<span className="req">*</span>
            </p>
            <textarea
              className="slide-textarea"
              value={frustration}
              onChange={(e) => setFrustration(e.target.value)}
            />
          </div>
          <div className="slide-q-group">
            <p className="slide-q">
              If you could change one thing to improve the virtual meetings that you attend, what
              would it be? What would you modify? Briefly describe it in this textbox (one or two
              sentences is fine).<span className="req">*</span>
            </p>
            <textarea
              className="slide-textarea"
              placeholder={
                preTaskChange.trim() !== ""
                  ? `Here's what you said before: "${preTaskChange}" — would you like to expand or modify it?`
                  : undefined
              }
              value={wouldChange}
              onChange={(e) => setWouldChange(e.target.value)}
            />
          </div>
        </SlideScreen>
        {showIncompleteNotice && (
          <NoticeModal
            message="Please answer all the questions before continuing."
            onDismiss={() => setShowIncompleteNotice(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SlideScreen
        align="left"
        innerClassName="post-task-time-wide"
        lines={[
          "Thank you for sharing your ideas about virtual meetings.",
          "In the future, we are also going to ask the consultants to evaluate the recommendations submitted from this survey you are taking now (anonymously).",
          "If you could meet with the consultants to review your suggestion, how much time would you spend with each? Allocate 30 minutes in the space below...",
        ]}
        onBack={() => setSubPage(0)}
        onContinue={() => {
          if (!timeValid) {
            setShowTimeNotice(true);
            return;
          }
          onComplete({ refinedRec, frustration, wouldChange, timeC });
        }}
        continueMuted={!timeValid}
        continueLabel="Continue"
        submitting={submitting}
      >
        <div className="time-section">
          {showExceedNotice && (
            <div className="toast" role="alert">
              Total cannot exceed 30 minutes
            </div>
          )}
          {CONSULTANTS.map((name) => {
            const overMax = timeC[name] > 30;
            return (
              <div className={`time-row ${overMax ? "error" : ""}`} key={name}>
                <div className="time-name">
                  <Avatar init={CONSULTANT_META[name].init} color={CONSULTANT_META[name].color} size={34} />
                  {name}
                </div>
                <div className="time-input-wrap">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    className="time-input"
                    placeholder="0-30"
                    value={
                      editingTime?.name === name
                        ? editingTime.text
                        : timeC[name] === 0
                          ? ""
                          : String(timeC[name])
                    }
                    onFocus={(e) => {
                      setEditingTime({ name, text: timeC[name] === 0 ? "" : String(timeC[name]) });
                      e.target.select();
                    }}
                    onBlur={() => setEditingTime(null)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
                      setEditingTime({ name, text: raw });
                      const value = raw === "" || raw === "." ? 0 : Number(raw);
                      if (value > 30) setShowExceedNotice(true);
                      setTime(name, value);
                    }}
                  />
                  <span className="time-unit">min</span>
                </div>
                {overMax && <p className="time-warn">You have 30 mins maximum to split between consultants</p>}
              </div>
            );
          })}
          <div className={`time-total ${timeValid ? "ok" : "bad"}`}>
            <span>Total</span>
            <span>{total} / 30 minutes</span>
          </div>
        </div>
      </SlideScreen>
      {showTimeNotice && (
        <NoticeModal
          message={
            total > 30
              ? "Your total time exceeds 30 minutes. Please adjust your answer so it adds up to exactly 30 minutes."
              : "Your total time must add up to exactly 30 minutes. Please adjust your answer before continuing."
          }
          onDismiss={() => setShowTimeNotice(false)}
        />
      )}
    </>
  );
}
