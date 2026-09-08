"use client";

import { useState } from "react";
import SlideScreen from "@/components/ui/SlideScreen";

export default function TaskBriefScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const [page, setPage] = useState(0);

  if (page === 0) {
    return (
      <SlideScreen
        align="left"
        lines={["You will now review suggestions submitted by other working professionals."]}
        onBack={onBack}
        onContinue={() => setPage(1)}
      />
    );
  }

  return (
    <SlideScreen
      align="left"
      lines={[
        <>
          Over the past few years, we have tried to collect a broad range of employee ideas for how to improve virtual meetings.{" "}
          <span className="brief-split-line">Some of the suggestions may resonate with your own experiences. Others may not. We are interested in your honest evaluations.</span>
        </>,
      ]}
      onBack={() => setPage(0)}
      onContinue={onContinue}
      continueLabel="Continue"
    />
  );
}
