"use client";

import SlideScreen from "@/components/ui/SlideScreen";

export default function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <SlideScreen
      title="Thank you for participating!"
      align="left"
      innerClassName="welcome-inner-centered"
      lines={[
        <span key="lead" className="welcome-lead-line">
          In this study, you will share your opinions of virtual meetings. You will also rate ways to improve virtual meetings.
        </span>,
        <span key="next">On the next page, you will complete an IRB form. Then, you will proceed to the study.</span>,
      ]}
      onContinue={onContinue}
    />
  );
}
