"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import RevealPreziScreen from "@/components/screens/RevealPreziScreen";
import { CONSULTANTS, type ConsultantName } from "@/lib/consultants";
import { useStudy } from "@/lib/study-context";

function RevealPreziPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pRes, pStrongRec, pWeakRec, consultantData } = useStudy();
  // pStrongRec/pWeakRec can be legitimately null (participant agreed or
  // disagreed with all 10 statements, so has no genuine top/bottom pick) —
  // don't gate readiness on them, only on the always-present pRes/
  // consultantData.
  const ready = pRes && consultantData;

  useEffect(() => {
    if (!ready) router.replace("/task-brief");
  }, [ready, router]);

  if (!ready) return null;

  const consultantParam = searchParams.get("consultant");
  const highlightConsultant = CONSULTANTS.includes(consultantParam as ConsultantName)
    ? (consultantParam as ConsultantName)
    : null;

  return (
    <RevealPreziScreen
      pRes={pRes}
      pStrongRec={pStrongRec}
      pWeakRec={pWeakRec}
      consultantData={consultantData}
      onContinue={() => router.push("/post-review")}
      onBack={() => router.push("/reveal-agreement")}
      highlightConsultant={highlightConsultant}
    />
  );
}

export default function RevealPreziPage() {
  return (
    <Suspense fallback={null}>
      <RevealPreziPageInner />
    </Suspense>
  );
}
