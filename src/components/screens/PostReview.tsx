"use client";

import SlideScreen from "@/components/ui/SlideScreen";

export default function PostReview({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <SlideScreen
      align="left"
      innerClassName="post-review-wide"
      lines={[
        "Now that you have seen suggestions from others for improving virtual meetings, we would like to give you a chance to say more about what you think works well versus poorly about virtual meetings."
      ]}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
