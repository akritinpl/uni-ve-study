"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SpecificMeetingGazeSpeaking, {
  type SpecificMeetingGazeSpeakingAnswers,
} from "@/components/screens/SpecificMeetingGazeSpeaking";
import { useStudy } from "@/lib/study-context";

export default function SpecificMeetingGazeSpeakingPage() {
  const router = useRouter();
  const { isSubmitted, referencedAttendee, handleSpecificMeetingSave } = useStudy();

  // No completed post-task means this route was reached out of order (e.g.
  // a direct URL visit or a stale back/forward state) — send them to where
  // the task actually starts rather than crashing on missing data.
  useEffect(() => {
    if (!isSubmitted("post-task")) router.replace("/task-brief");
  }, [isSubmitted, router]);

  if (!isSubmitted("post-task")) return null;

  async function onComplete(answers: SpecificMeetingGazeSpeakingAnswers) {
    const ok = await handleSpecificMeetingSave({ gazeSpeaking: answers.gaze });
    if (ok) router.push("/specific-meeting-impressions");
  }

  return (
    <SpecificMeetingGazeSpeaking
      personInitials={referencedAttendee}
      onComplete={onComplete}
      onBack={() => router.push("/specific-meeting-gaze")}
    />
  );
}
