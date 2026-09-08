"use client";

import SlideScreen from "@/components/ui/SlideScreen";

export default function RevealIntroScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <SlideScreen
      align="left"
      lines={[
        "In addition to working professionals, we also asked two MBA consultants to independently review the same employee suggestions. On the following pages, you will see their endorsement decisions – which suggestions they supported and which they did not."
      ]}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
