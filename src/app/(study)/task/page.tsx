"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StepLockedNotice from "@/components/screens/StepLockedNotice";
import TaskSurvey from "@/components/screens/TaskSurvey";
import { useStudy } from "@/lib/study-context";
import type { Ratings } from "@/lib/matching";

export default function TaskPage() {
  const router = useRouter();
  const { handleTaskComplete, isSubmitted, nextStepAfter } = useStudy();
  const [submitting, setSubmitting] = useState(false);

  // Skip the locked notice while `submitting` is true — that covers the gap
  // between handleTaskComplete marking this step submitted and router.push
  // actually swapping the route, during which this page would otherwise
  // re-render and flash the notice on a step the participant is still
  // completing (not returning to).
  if (isSubmitted("task") && !submitting) {
    return (
      <StepLockedNotice
        message="You've already submitted your ratings for this task. They can't be changed now, because the next part of the study is generated from your original answers."
        continueLabel="Continue"
        onContinue={() => router.push(`/${nextStepAfter("task")}`)}
      />
    );
  }

  async function onComplete(
    ratings: Ratings,
    pStrongRec: [number, number] | null,
    pWeakRec: [number, number] | null,
  ) {
    setSubmitting(true);
    const ok = await handleTaskComplete(ratings, pStrongRec, pWeakRec);
    if (ok) {
      router.push("/reveal-intro");
    } else {
      setSubmitting(false);
    }
  }

  return (
    <TaskSurvey
      onComplete={onComplete}
      submitting={submitting}
      onBack={() => router.push("/task-brief")}
    />
  );
}
