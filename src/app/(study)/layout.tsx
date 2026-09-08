"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { STEP_ORDER, StudyProvider } from "@/lib/study-context";
import SaveErrorToast from "@/components/SaveErrorToast";
import StudyProgressBar from "@/components/StudyProgressBar";

// This layout does NOT remount when navigating between sibling routes in
// this group (e.g. /consent -> /pre-task), so StudyProvider's in-memory
// state survives client-side navigation exactly like StudyApp's single
// component used to — sessionStorage is only needed for a hard refresh.
export default function StudyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Warm every route in the study up front. In dev, Next.js otherwise
  // compiles each route on demand the first time it's visited, which reads
  // as a glitch/freeze right when a participant clicks "Continue" — same
  // problem router.push always had, just invisible until routing replaced
  // the old single-page setStep() swaps.
  useEffect(() => {
    for (const step of STEP_ORDER) router.prefetch(`/${step}`);
  }, [router]);

  return (
    <StudyProvider>
      <StudyProgressBar />
      {children}
      <SaveErrorToast />
    </StudyProvider>
  );
}
