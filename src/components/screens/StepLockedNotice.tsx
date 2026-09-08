"use client";

import SlideScreen from "@/components/ui/SlideScreen";

// Shown in place of a step's live form when the participant navigates
// (typically via browser back) to a step whose data was already submitted.
// Reused for "task" (where re-editing after the reveal would contaminate the
// study's core measurement — no answers are shown, just blocked) and
// "post-task" (where showing the exact prior answers isn't worth persisting
// extra state for, since nothing downstream depends on them).
export default function StepLockedNotice({
  message,
  continueLabel,
  onContinue,
}: {
  message: string;
  continueLabel: string;
  onContinue: () => void;
}) {
  return (
    <SlideScreen
      align="left"
      lines={[message]}
      onContinue={onContinue}
      continueLabel={continueLabel}
    />
  );
}
