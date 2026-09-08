"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SpecificMeetingFollowup, {
  type SpecificMeetingFollowupAnswers,
} from "@/components/screens/SpecificMeetingFollowup";
import { useStudy } from "@/lib/study-context";

export default function SpecificMeetingFollowupPage() {
  const router = useRouter();
  const { isSubmitted, handleSpecificMeetingSave } = useStudy();

  // No completed post-task means this route was reached out of order (e.g.
  // a direct URL visit or a stale back/forward state) — send them to where
  // the task actually starts rather than crashing on missing data.
  useEffect(() => {
    if (!isSubmitted("post-task")) router.replace("/task-brief");
  }, [isSubmitted, router]);

  if (!isSubmitted("post-task")) return null;

  async function onComplete(answers: SpecificMeetingFollowupAnswers) {
    const ok = await handleSpecificMeetingSave({
      hadAgenda: answers.hadAgenda === "yes",
      startedOnTime: answers.startedOnTime === "yes",
      productivity: answers.productivity,
      productivityReason: answers.productivityReason,
    });
    if (ok) router.push("/specific-meeting-gaze");
  }

  return (
    <SpecificMeetingFollowup
      onComplete={onComplete}
      onBack={() => router.push("/specific-meeting-questions")}
    />
  );
}
