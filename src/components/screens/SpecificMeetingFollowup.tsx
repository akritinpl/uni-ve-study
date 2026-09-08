"use client";

import { useState } from "react";
import NoticeModal from "@/components/ui/NoticeModal";
import SlideScreen from "@/components/ui/SlideScreen";

export type SpecificMeetingFollowupAnswers = {
  hadAgenda: "yes" | "no";
  startedOnTime: "yes" | "no";
  productivity: number;
  productivityReason: string;
};

const SCALE = [1, 2, 3, 4, 5, 6, 7];

export default function SpecificMeetingFollowup({
  onComplete,
  onBack,
}: {
  onComplete: (answers: SpecificMeetingFollowupAnswers) => void;
  onBack: () => void;
}) {
  const [hadAgenda, setHadAgenda] = useState<"yes" | "no" | null>(null);
  const [startedOnTime, setStartedOnTime] = useState<"yes" | "no" | null>(null);
  const [productivity, setProductivity] = useState<number | null>(null);
  const [productivityReason, setProductivityReason] = useState("");
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(false);

  const valid =
    hadAgenda !== null &&
    startedOnTime !== null &&
    productivity !== null &&
    productivityReason.trim() !== "";

  return (
    <>
      <SlideScreen
        align="left"
        lines={["Please answer the following questions about your recent virtual meeting."]}
        onBack={onBack}
        continueMuted={!valid}
        onContinue={() => {
          if (!valid || hadAgenda === null || startedOnTime === null || productivity === null) {
            setShowIncompleteNotice(true);
            return;
          }
          onComplete({ hadAgenda, startedOnTime, productivity, productivityReason });
        }}
      >
        <div className="slide-q-group">
          <p className="slide-q">
            Was an agenda used?<span className="req">*</span>
          </p>
          <div className="pick-list">
            <div
              className={`pick-card ${hadAgenda === "yes" ? "sel" : ""}`}
              onClick={() => setHadAgenda("yes")}
            >
              <span className="pick-text">Yes, there was an agenda for the meeting</span>
            </div>
            <div
              className={`pick-card ${hadAgenda === "no" ? "sel" : ""}`}
              onClick={() => setHadAgenda("no")}
            >
              <span className="pick-text">No, there was no agenda for the meeting</span>
            </div>
          </div>
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            Did the meeting start on time?<span className="req">*</span>
          </p>
          <div className="pick-list">
            <div
              className={`pick-card ${startedOnTime === "yes" ? "sel" : ""}`}
              onClick={() => setStartedOnTime("yes")}
            >
              <span className="pick-text">Yes, the meeting started promptly</span>
            </div>
            <div
              className={`pick-card ${startedOnTime === "no" ? "sel" : ""}`}
              onClick={() => setStartedOnTime("no")}
            >
              <span className="pick-text">No, the meeting did not start on time</span>
            </div>
          </div>
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            How productive did you find the meeting?<span className="req">*</span>
          </p>
          <div className="scale-row">
            <div className="scale-endpoints">
              <span>Very unproductive</span>
              <span>Very productive</span>
            </div>
            <div className="scale-dots">
              {SCALE.map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`scale-dot ${productivity === n ? "sel" : ""}`}
                  onClick={() => setProductivity(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            What was the main reason that you found the virtual meeting either productive or
            unproductive?<span className="req">*</span>
          </p>
          <textarea
            className="slide-textarea"
            value={productivityReason}
            onChange={(e) => setProductivityReason(e.target.value)}
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
