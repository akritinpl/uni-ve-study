"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { STEP_ORDER, type Step } from "@/lib/study-context";

const STORAGE_KEY = "ve-study-session";

// Submittable steps in walk order — kept in sync with STEP_ORDER/SubmittableStep
// in study-context.tsx.
const SUBMITTABLE_ORDER: Step[] = ["consent", "pre-task", "task", "post-task", "demographics"];

// `/` is a resume dispatcher, not a screen itself: it reads whatever was
// last persisted to sessionStorage and sends the participant to the step
// right after the furthest submitted step, or to /welcome for a brand new
// session. Kept out of (study)'s provider tree since it only needs a
// one-time read, not the live context.
function resumeStep(): Step {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return "welcome";
    const saved = JSON.parse(raw) as { submittedSteps?: string[] };
    const submitted = new Set(saved.submittedSteps ?? []);
    let result: Step = "welcome";
    for (const step of SUBMITTABLE_ORDER) {
      if (!submitted.has(step)) continue;
      const i = STEP_ORDER.indexOf(step);
      result = STEP_ORDER[Math.min(i + 1, STEP_ORDER.length - 1)];
    }
    return result;
  } catch {
    return "welcome";
  }
}

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${resumeStep()}`);
  }, [router]);
  return null;
}
