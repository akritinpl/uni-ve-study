"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PreTaskScreen from "@/components/screens/PreTaskScreen";
import { useStudy } from "@/lib/study-context";

export default function PreTaskPage() {
  const router = useRouter();
  const { preTaskChange, setPreTaskChange, handlePreTaskContinue, isSubmitted } = useStudy();
  const locked = isSubmitted("pre-task");
  const [submitting, setSubmitting] = useState(false);

  async function onContinue() {
    setSubmitting(true);
    const ok = locked || (await handlePreTaskContinue());
    setSubmitting(false);
    if (ok) router.push("/task-brief");
  }

  return (
    <PreTaskScreen
      value={preTaskChange}
      onChange={setPreTaskChange}
      onContinue={onContinue}
      onBack={() => router.push("/consent")}
      locked={locked}
      submitting={submitting}
    />
  );
}
