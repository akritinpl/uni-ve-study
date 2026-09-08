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

  if (isSubmitted("demographics")) {
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
    setSubmitting(false);
    if (ok) router.push("/thanks");
  }

  return (
    <DemographicsSurvey
      onComplete={onComplete}
      submitting={submitting}
      onBack={() => router.push("/specific-meeting-impressions")}
    />
  );
}
