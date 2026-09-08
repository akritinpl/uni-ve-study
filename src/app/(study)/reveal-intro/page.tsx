"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RevealIntroScreen from "@/components/screens/RevealIntroScreen";
import { useStudy } from "@/lib/study-context";

export default function RevealIntroPage() {
  const router = useRouter();
  const { consultantData } = useStudy();

  // No completed task data means this route was reached out of order (e.g.
  // a direct URL visit or a stale back/forward state) — send them to where
  // the task actually starts rather than crashing on missing data.
  useEffect(() => {
    if (!consultantData) router.replace("/task-brief");
  }, [consultantData, router]);

  if (!consultantData) return null;

  return (
    <RevealIntroScreen
      onContinue={() => router.push("/reveal-agreement")}
      onBack={() => router.push("/task")}
    />
  );
}
