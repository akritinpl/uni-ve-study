"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SpecificMeetingCriteria from "@/components/screens/SpecificMeetingCriteria";
import { useStudy } from "@/lib/study-context";

export default function SpecificMeetingCriteriaPage() {
  const router = useRouter();
  const { isSubmitted } = useStudy();

  // No completed post-task means this route was reached out of order (e.g.
  // a direct URL visit or a stale back/forward state) — send them to where
  // the task actually starts rather than crashing on missing data.
  useEffect(() => {
    if (!isSubmitted("post-task")) router.replace("/task-brief");
  }, [isSubmitted, router]);

  if (!isSubmitted("post-task")) return null;

  return (
    <SpecificMeetingCriteria
      onContinue={() => router.push("/specific-meeting-questions")}
      onBack={() => router.push("/specific-meeting-intro")}
    />
  );
}
