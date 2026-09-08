"use client";

import { useState } from "react";
import NoticeModal from "@/components/ui/NoticeModal";
import SlideScreen from "@/components/ui/SlideScreen";

export type SpecificMeetingAnswers = {
  recurring: "recurring" | "one-off";
  dayOfWeek: string;
  memoryStrength: number;
  attendee1: string;
  attendee2: string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SCALE = [1, 2, 3, 4, 5, 6, 7];

export default function SpecificMeetingQuestions({
  onComplete,
  onBack,
}: {
  onComplete: (answers: SpecificMeetingAnswers) => void;
  onBack: () => void;
}) {
  const [recurring, setRecurring] = useState<"recurring" | "one-off" | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<string | null>(null);
  const [memoryStrength, setMemoryStrength] = useState<number | null>(null);
  const [attendee1, setAttendee1] = useState("");
  const [attendee2, setAttendee2] = useState("");
  const [showIncompleteNotice, setShowIncompleteNotice] = useState(false);

  const valid =
    recurring !== null &&
    dayOfWeek !== null &&
    memoryStrength !== null &&
    attendee1.trim() !== "" &&
    attendee2.trim() !== "";

  return (
    <>
      <SlideScreen
        align="left"
        lines={["Please answer the following questions about your recent virtual meeting."]}
        onBack={onBack}
        continueMuted={!valid}
        onContinue={() => {
          if (!valid || recurring === null || dayOfWeek === null || memoryStrength === null) {
            setShowIncompleteNotice(true);
            return;
          }
          onComplete({ recurring, dayOfWeek, memoryStrength, attendee1, attendee2 });
        }}
      >
        <div className="slide-q-group">
          <p className="slide-q">
            Was the meeting a recurring meeting or a one-off meeting?<span className="req">*</span>
          </p>
          <div className="pick-list">
            <div
              className={`pick-card ${recurring === "recurring" ? "sel" : ""}`}
              onClick={() => setRecurring("recurring")}
            >
              <span className="pick-text">The meeting was recurring (it happens repeatedly on a schedule)</span>
            </div>
            <div
              className={`pick-card ${recurring === "one-off" ? "sel" : ""}`}
              onClick={() => setRecurring("one-off")}
            >
              <span className="pick-text">The meeting was a one-off meeting</span>
            </div>
          </div>
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            Do you remember what day of the week the meeting occurred?<span className="req">*</span>
          </p>
          <div className="day-pill-row">
            {DAYS.map((day) => (
              <button
                type="button"
                key={day}
                className={`day-pill ${dayOfWeek === day ? "sel" : ""}`}
                onClick={() => setDayOfWeek(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            How strongly do you remember what happened during the meeting?<span className="req">*</span>
          </p>
          <div className="scale-row">
            <div className="scale-endpoints">
              <span>Not at all</span>
              <span>Very strongly</span>
            </div>
            <div className="scale-dots">
              {SCALE.map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`scale-dot ${memoryStrength === n ? "sel" : ""}`}
                  onClick={() => setMemoryStrength(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            Please list the initials (e.g., CD) of one of the other attendees who spoke or said
            something during the meeting.<span className="req">*</span>
          </p>
          <input
            type="text"
            className="slide-input"
            placeholder="e.g., CD"
            value={attendee1}
            onChange={(e) => setAttendee1(e.target.value.toUpperCase())}
          />
        </div>

        <div className="slide-q-group">
          <p className="slide-q">
            Please list the initials (e.g., RY) of another, second attendee who spoke or said
            something during the meeting.<span className="req">*</span>
          </p>
          <input
            type="text"
            className="slide-input"
            placeholder="e.g., RY"
            value={attendee2}
            onChange={(e) => setAttendee2(e.target.value.toUpperCase())}
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
