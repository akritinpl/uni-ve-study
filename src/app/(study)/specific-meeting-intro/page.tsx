"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SpecificMeetingIntro from "@/components/screens/SpecificMeetingIntro";
import { useStudy } from "@/lib/study-context";

export default function SpecificMeetingIntroPage() {
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
    <SpecificMeetingIntro
      onContinue={() => router.push("/specific-meeting-criteria")}
      onBack={() => router.push("/post-task")}
    />
  );
}
