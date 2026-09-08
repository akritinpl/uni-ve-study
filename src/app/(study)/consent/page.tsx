"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConsentScreen from "@/components/screens/ConsentScreen";
import { useStudy } from "@/lib/study-context";

export default function ConsentPage() {
  const router = useRouter();
  const { handleConsent, isSubmitted } = useStudy();
  const locked = isSubmitted("consent");
  const [submitting, setSubmitting] = useState(false);

  async function onContinue() {
    setSubmitting(true);
    const ok = locked || (await handleConsent());
    // Every downstream table has a foreign key to irb_consent.participant_id,
    // so don't advance without a real, saved consent record — retry instead.
    if (ok) {
      router.push("/pre-task");
    } else {
      setSubmitting(false);
    }
  }

  return (
    <ConsentScreen
      onContinue={onContinue}
      onBack={() => router.push("/welcome")}
      locked={locked}
      submitting={submitting}
    />
  );
}
