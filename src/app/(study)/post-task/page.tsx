"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PostTaskSurvey, { type PostTaskAnswers } from "@/components/screens/PostTaskSurvey";
import StepLockedNotice from "@/components/screens/StepLockedNotice";
import { useStudy } from "@/lib/study-context";

export default function PostTaskPage() {
  const router = useRouter();
  const { handlePostTaskComplete, isSubmitted, nextStepAfter, preTaskChange } = useStudy();
  const [submitting, setSubmitting] = useState(false);

  if (isSubmitted("post-task")) {
    return (
      <StepLockedNotice
        message="You've already completed this part of the study."
        continueLabel="Continue"
        onContinue={() => router.push(`/${nextStepAfter("post-task")}`)}
      />
    );
  }

  async function onComplete(answers: PostTaskAnswers) {
    setSubmitting(true);
    const ok = await handlePostTaskComplete(answers);
    setSubmitting(false);
    // Only advance once the save actually succeeded — otherwise the next
    // page's isSubmitted("post-task") guard would immediately bounce the
    // participant back out (to /task-brief), which looks like the app is
    // stuck in a loop after they just finished splitting their time.
    if (ok) router.push("/specific-meeting-intro");
  }

  return (
    <PostTaskSurvey
      onComplete={onComplete}
      submitting={submitting}
      preTaskChange={preTaskChange}
      onBack={() => router.push("/post-review")}
    />
  );
}
