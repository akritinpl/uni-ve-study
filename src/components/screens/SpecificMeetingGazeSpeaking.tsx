"use client";

import { useState } from "react";
import NoticeModal from "@/components/ui/NoticeModal";
import SlideScreen from "@/components/ui/SlideScreen";

export type SpecificMeetingGazeSpeakingAnswers = {
  gaze: number;
};

const SCALE = [1, 2, 3, 4, 5, 6, 7];

export default function SpecificMeetingGazeSpeaking({
  personInitials,
  onComplete,
  onBack,
}: {
  personInitials: string;
  onComplete: (answers: SpecificMeetingGazeSpeakingAnswers) => void;
  onBack: () => void;
}) {
  const [gaze, setGaze] = useState<number | null>(null);
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(false);
  const person = personInitials.trim() !== "" ? personInitials : "this attendee";

  return (
    <>
      <SlideScreen
        align="left"
        lines={[]}
        onBack={onBack}
        continueMuted={gaze === null}
        onContinue={() => {
          if (gaze === null) {
            setShowIncompleteNotice(true);
            return;
          }
          onComplete({ gaze });
        }}
      >
        <div className="slide-q-group">
          <p className="slide-q">
            Conversely, when this person {person} was presenting their answer/actually speaking,
            where was their gaze directed?
            <span className="req">*</span>
          </p>
          <div className="scale-row">
            <div className="scale-labels-3">
              <span style={{ gridColumn: 1 }}>Looking directly at the camera/screen</span>
              <span style={{ gridColumn: 4 }}>Mixed or about equal</span>
              <span style={{ gridColumn: 7 }}>Looking away from the camera/screen</span>
            </div>
            <div className="scale-dots">
              {SCALE.map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`scale-dot ${gaze === n ? "sel" : ""}`}
                  onClick={() => setGaze(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SlideScreen>
      {showIncompleteNotice && (
        <NoticeModal
          message="Please answer the question before continuing."
          onDismiss={() => setShowIncompleteNotice(false)}
        />
      )}
    </>
  );
}
