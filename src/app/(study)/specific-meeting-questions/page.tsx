"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SpecificMeetingQuestions, {
  type SpecificMeetingAnswers,
} from "@/components/screens/SpecificMeetingQuestions";
import { useStudy } from "@/lib/study-context";

export default function SpecificMeetingQuestionsPage() {
  const router = useRouter();
  const { isSubmitted, setAttendee1, setAttendee2, handleSpecificMeetingSave } = useStudy();

  // No completed post-task means this route was reached out of order (e.g.
  // a direct URL visit or a stale back/forward state) — send them to where
  // the task actually starts rather than crashing on missing data.
  useEffect(() => {
    if (!isSubmitted("post-task")) router.replace("/task-brief");
  }, [isSubmitted, router]);

  if (!isSubmitted("post-task")) return null;

  async function onComplete(answers: SpecificMeetingAnswers) {
    setAttendee1(answers.attendee1);
    setAttendee2(answers.attendee2);
    const ok = await handleSpecificMeetingSave({
      recurring: answers.recurring,
      dayOfWeek: answers.dayOfWeek,
      memoryStrength: answers.memoryStrength,
      attendee1: answers.attendee1,
      attendee2: answers.attendee2,
    });
    if (ok) router.push("/specific-meeting-followup");
  }

  return (
    <SpecificMeetingQuestions
      onComplete={onComplete}
      onBack={() => router.push("/specific-meeting-criteria")}
    />
  );
}
