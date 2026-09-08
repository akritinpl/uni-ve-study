"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { DemographicsAnswers } from "@/components/screens/DemographicsSurvey";
import type { PostTaskAnswers } from "@/components/screens/PostTaskSurvey";
import { postJson } from "@/lib/api";
import { generateConsultantData, type ConsultantData, type Ratings } from "@/lib/matching";
import { seededRandom } from "@/lib/rng";

export type Step =
  | "welcome"
  | "consent"
  | "pre-task"
  | "task-brief"
  | "task"
  | "reveal-intro"
  | "reveal-agreement"
  | "reveal-prezi"
  | "post-review"
  | "post-task"
  | "specific-meeting-intro"
  | "specific-meeting-criteria"
  | "specific-meeting-questions"
  | "specific-meeting-followup"
  | "specific-meeting-gaze"
  | "specific-meeting-gaze-2"
  | "specific-meeting-impressions"
  | "demographics"
  | "thanks";

// Walk order of the study. Used to find "the next unsubmitted step" when a
// participant is bounced forward out of a locked, already-submitted step.
export const STEP_ORDER: Step[] = [
  "welcome",
  "consent",
  "pre-task",
  "task-brief",
  "task",
  "reveal-intro",
  "reveal-agreement",
  "reveal-prezi",
  "post-review",
  "post-task",
  "specific-meeting-intro",
  "specific-meeting-criteria",
  "specific-meeting-questions",
  "specific-meeting-followup",
  "specific-meeting-gaze",
  "specific-meeting-gaze-2",
  "specific-meeting-impressions",
  "demographics",
  "thanks",
];

// Steps that write to Supabase and must not be resubmitted or re-edited once
// submitted (see the anchoring-bias discussion for "task" specifically).
type SubmittableStep = "consent" | "pre-task" | "task" | "post-task" | "demographics";

// Persists progress across a refresh within the same tab. sessionStorage
// (not localStorage) so a closed tab starts a genuinely fresh session rather
// than resurrecting a stale/finished one.
const STORAGE_KEY = "ve-study-session";

type PersistedState = {
  participantId: string | null;
  preTaskChange: string;
  attendee1: string;
  attendee2: string;
  pRes: Ratings | null;
  pStrongRec: [number, number] | null;
  pWeakRec: [number, number] | null;
  submittedSteps: SubmittableStep[];
};

function loadPersisted(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : null;
  } catch {
    return null;
  }
}

type StudyContextValue = {
  participantId: string | null;
  preTaskChange: string;
  setPreTaskChange: (value: string) => void;
  attendee1: string;
  setAttendee1: (value: string) => void;
  attendee2: string;
  setAttendee2: (value: string) => void;
  // The attendee referenced in the specific-meeting gaze/impressions
  // questions — deterministically randomized per participant (via
  // participantId seed) between attendee1 and attendee2, so it stays
  // consistent across those pages and a refresh, but half of participants
  // see one and half see the other.
  referencedAttendee: string;
  pRes: Ratings | null;
  pStrongRec: [number, number] | null;
  pWeakRec: [number, number] | null;
  consultantData: Record<string, ConsultantData> | null;
  saveError: boolean;
  submittedSteps: Set<SubmittableStep>;
  isSubmitted: (step: SubmittableStep) => boolean;
  // Returns the earliest step in STEP_ORDER the participant hasn't reached
  // yet, based on which submittable steps are already done. Used to route a
  // participant forward when they land on a locked step.
  nextStepAfter: (step: Step) => Step;
  handleConsent: () => Promise<boolean>;
  handlePreTaskContinue: () => Promise<boolean>;
  handleTaskComplete: (
    ratings: Ratings,
    pStrongRec: [number, number] | null,
    pWeakRec: [number, number] | null,
  ) => Promise<boolean>;
  handlePostTaskComplete: (answers: PostTaskAnswers) => Promise<boolean>;
  // Saves one page's worth of fields from the specific-meeting-* flow. Each
  // page in that flow calls this with just the fields it collected — the
  // API route upserts them onto the participant's single specific_meeting
  // row without touching columns from other pages.
  handleSpecificMeetingSave: (fields: Record<string, unknown>) => Promise<boolean>;
  handleDemographicsComplete: (answers: DemographicsAnswers) => Promise<boolean>;
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within StudyProvider");
  return ctx;
}

export function StudyProvider({ children }: { children: React.ReactNode }) {
  // Read once on mount. StudyProvider only ever renders client-side, so
  // there's no server render to mismatch against — a plain lazy initializer
  // is safe here, same as the single-page version did.
  const [saved] = useState(loadPersisted);

  const [participantId, setParticipantId] = useState<string | null>(
    () => saved?.participantId ?? null,
  );
  const [preTaskChange, setPreTaskChange] = useState(() => saved?.preTaskChange ?? "");
  const [attendee1, setAttendee1] = useState(() => saved?.attendee1 ?? "");
  const [attendee2, setAttendee2] = useState(() => saved?.attendee2 ?? "");
  const [pRes, setPRes] = useState<Ratings | null>(() => saved?.pRes ?? null);
  const [pStrongRec, setPStrongRec] = useState<[number, number] | null>(
    () => saved?.pStrongRec ?? null,
  );
  const [pWeakRec, setPWeakRec] = useState<[number, number] | null>(() => saved?.pWeakRec ?? null);
  const [submittedSteps, setSubmittedSteps] = useState<Set<SubmittableStep>>(
    () => new Set(saved?.submittedSteps ?? []),
  );
  const [saveError, setSaveError] = useState(false);

  // pStrongRec/pWeakRec can be legitimately null (participant agreed or
  // disagreed with all 10 statements) — generateConsultantData already
  // handles null for either, so don't gate this on them being truthy.
  const consultantData =
    participantId && pRes
      ? generateConsultantData(participantId, pRes, pStrongRec, pWeakRec)
      : null;

  // Half of participants should see attendee1 referenced in the
  // specific-meeting gaze/impressions questions, half attendee2 — seeded off
  // participantId so the pick is stable across those pages and a refresh
  // without needing its own persisted field.
  const referencedAttendee =
    attendee2.trim() === ""
      ? attendee1
      : participantId && seededRandom(`${participantId}:attendee-ref`)() < 0.5
      ? attendee1
      : attendee2;

  useEffect(() => {
    const snapshot: PersistedState = {
      participantId,
      preTaskChange,
      attendee1,
      attendee2,
      pRes,
      pStrongRec,
      pWeakRec,
      submittedSteps: [...submittedSteps],
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // sessionStorage unavailable (private browsing, quota, etc.) — refresh
      // just won't resume; the rest of the flow still works.
    }
  }, [participantId, preTaskChange, attendee1, attendee2, pRes, pStrongRec, pWeakRec, submittedSteps]);

  function markSubmitted(step: SubmittableStep) {
    setSubmittedSteps((prev) => new Set(prev).add(step));
  }

  function isSubmitted(step: SubmittableStep) {
    return submittedSteps.has(step);
  }

  function nextStepAfter(step: Step): Step {
    const i = STEP_ORDER.indexOf(step);
    return STEP_ORDER[Math.min(i + 1, STEP_ORDER.length - 1)];
  }

  // Guards against double-submits (double-click, or a re-mount from browser
  // back/forward re-running a handler) firing a second POST for a step
  // that's already been recorded — the DB has a primary-key constraint per
  // participant on these tables, so a duplicate insert would 500.
  const inFlight = useRef<Set<SubmittableStep>>(new Set());

  async function handleConsent(): Promise<boolean> {
    if (submittedSteps.has("consent")) return true;
    if (inFlight.current.has("consent")) return false;
    inFlight.current.add("consent");
    const { ok, data } = await postJson<{ participantId: string }>("/api/consent", {
      irbConsented: true,
    });
    setSaveError(!ok);
    if (ok && data) {
      setParticipantId(data.participantId);
      markSubmitted("consent");
      return true;
    }
    // Leave participantId/submitted state untouched so a retry (e.g. the
    // user clicking Continue again) can succeed instead of silently
    // fabricating an id that was never actually written to the DB — every
    // downstream table has a foreign key to irb_consent.participant_id.
    inFlight.current.delete("consent");
    return false;
  }

  async function handlePreTaskContinue(): Promise<boolean> {
    if (submittedSteps.has("pre-task")) return true;
    if (inFlight.current.has("pre-task")) return false;
    inFlight.current.add("pre-task");
    const { ok } = await postJson("/api/pre-task", { participantId, preTaskChange });
    if (!ok) {
      setSaveError(true);
      inFlight.current.delete("pre-task");
      return false;
    }
    markSubmitted("pre-task");
    return true;
  }

  async function handleTaskComplete(
    ratings: Ratings,
    strongRec: [number, number] | null,
    weakRec: [number, number] | null,
  ): Promise<boolean> {
    if (submittedSteps.has("task")) return true;
    if (inFlight.current.has("task")) return false;
    inFlight.current.add("task");
    const data = generateConsultantData(participantId!, ratings, strongRec, weakRec);
    setPRes(ratings);
    setPStrongRec(strongRec);
    setPWeakRec(weakRec);
    const { ok } = await postJson("/api/task", {
      participantId,
      pRes: ratings,
      pStrongRec: strongRec,
      pWeakRec: weakRec,
      consultantData: data,
    });
    if (!ok) {
      setSaveError(true);
      inFlight.current.delete("task");
      return false;
    }
    markSubmitted("task");
    return true;
  }

  async function handlePostTaskComplete(answers: PostTaskAnswers): Promise<boolean> {
    if (submittedSteps.has("post-task")) return true;
    if (inFlight.current.has("post-task")) return false;
    inFlight.current.add("post-task");
    const { ok: ok1 } = await postJson("/api/post-task", {
      participantId,
      refinedRec: answers.refinedRec,
      frustration: answers.frustration,
      wouldChange: answers.wouldChange,
    });
    const { ok: ok2 } = await postJson("/api/task/time", {
      participantId,
      timeC: answers.timeC,
    });
    if (!ok1 || !ok2) {
      setSaveError(true);
      inFlight.current.delete("post-task");
      return false;
    }
    markSubmitted("post-task");
    return true;
  }

  async function handleSpecificMeetingSave(fields: Record<string, unknown>): Promise<boolean> {
    const { ok } = await postJson("/api/specific-meeting", { participantId, ...fields });
    if (!ok) setSaveError(true);
    return ok;
  }

  async function handleDemographicsComplete(answers: DemographicsAnswers): Promise<boolean> {
    if (submittedSteps.has("demographics")) return true;
    if (inFlight.current.has("demographics")) return false;
    inFlight.current.add("demographics");
    const { ok } = await postJson("/api/demographics", { participantId, ...answers });
    if (!ok) {
      setSaveError(true);
      inFlight.current.delete("demographics");
      return false;
    }
    markSubmitted("demographics");
    return true;
  }

  return (
    <StudyContext.Provider
      value={{
        participantId,
        preTaskChange,
        setPreTaskChange,
        attendee1,
        setAttendee1,
        attendee2,
        setAttendee2,
        referencedAttendee,
        pRes,
        pStrongRec,
        pWeakRec,
        consultantData,
        saveError,
        submittedSteps,
        isSubmitted,
        nextStepAfter,
        handleConsent,
        handlePreTaskContinue,
        handleTaskComplete,
        handlePostTaskComplete,
        handleSpecificMeetingSave,
        handleDemographicsComplete,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}
