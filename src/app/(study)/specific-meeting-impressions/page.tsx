"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SpecificMeetingImpressions, {
  type SpecificMeetingImpressionsAnswers,
} from "@/components/screens/SpecificMeetingImpressions";
import { useStudy } from "@/lib/study-context";

export default function SpecificMeetingImpressionsPage() {
  const router = useRouter();
  const { isSubmitted, referencedAttendee, handleSpecificMeetingSave } = useStudy();

  // No completed post-task means this route was reached out of order (e.g.
  // a direct URL visit or a stale back/forward state) — send them to where
  // the task actually starts rather than crashing on missing data.
  useEffect(() => {
    if (!isSubmitted("post-task")) router.replace("/task-brief");
  }, [isSubmitted, router]);

  if (!isSubmitted("post-task")) return null;

  async function onComplete(answers: SpecificMeetingImpressionsAnswers) {
    const ok = await handleSpecificMeetingSave({ impressions: answers });
    if (ok) router.push("/demographics");
  }

  return (
    <SpecificMeetingImpressions
      personInitials={referencedAttendee}
      onComplete={onComplete}
      onBack={() => router.push("/specific-meeting-gaze-2")}
    />
  );
}
