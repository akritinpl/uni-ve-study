"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DemographicsSurvey, { type DemographicsAnswers } from "@/components/screens/DemographicsSurvey";
import StepLockedNotice from "@/components/screens/StepLockedNotice";
import { useStudy } from "@/lib/study-context";

export default function DemographicsPage() {
  const router = useRouter();
  const { handleDemographicsComplete, isSubmitted, nextStepAfter } = useStudy();
  const [submitting, setSubmitting] = useState(false);

  // Skip the locked notice while `submitting` is true — that covers the gap
  // between handleDemographicsComplete marking this step submitted and
  // router.push actually swapping the route, during which this page would
  // otherwise re-render and flash the notice on a step the participant is
  // still completing (not returning to).
  if (isSubmitted("demographics") && !submitting) {
    return (
      <StepLockedNotice
        message="You've already completed this part of the study."
        continueLabel="Continue"
        onContinue={() => router.push(`/${nextStepAfter("demographics")}`)}
      />
    );
  }

  async function onComplete(answers: DemographicsAnswers) {
    setSubmitting(true);
    const ok = await handleDemographicsComplete(answers);
    if (ok) {
      router.push("/thanks");
    } else {
      setSubmitting(false);
    }
  }

  return (
    <DemographicsSurvey
      onComplete={onComplete}
      submitting={submitting}
      onBack={() => router.push("/specific-meeting-impressions")}
    />
  );
}
