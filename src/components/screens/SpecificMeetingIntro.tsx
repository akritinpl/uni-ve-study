"use client";

import SlideScreen from "@/components/ui/SlideScreen";

export default function SpecificMeetingIntro({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <SlideScreen
      align="left"
      innerClassName="meeting-intro-wide"
      lines={[
        "So far, you have considered virtual meetings in general.",
        "We will now shift to a specific virtual meeting that you recently attended and ask what you remember about it.",
      ]}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
