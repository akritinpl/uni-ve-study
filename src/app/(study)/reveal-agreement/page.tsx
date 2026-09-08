"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RevealAgreementScreen from "@/components/screens/RevealAgreementScreen";
import { useStudy } from "@/lib/study-context";

export default function RevealAgreementPage() {
  const router = useRouter();
  const { pRes, consultantData } = useStudy();
  const ready = pRes && consultantData;

  useEffect(() => {
    if (!ready) router.replace("/task-brief");
  }, [ready, router]);

  if (!ready) return null;

  return (
    <RevealAgreementScreen
      pRes={pRes}
      consultantData={consultantData}
      onContinue={() => router.push("/reveal-prezi")}
      onBack={() => router.push("/reveal-intro")}
      onSelectConsultant={(name) => router.push(`/reveal-prezi?consultant=${encodeURIComponent(name)}`)}
    />
  );
}
