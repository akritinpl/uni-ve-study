"use client";

import SlideScreen from "@/components/ui/SlideScreen";

export default function SpecificMeetingCriteria({
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
        "Please think about a virtual meeting you recently attended that meets all of the following criteria:",
      ]}
      onBack={onBack}
      onContinue={onContinue}
    >
      <ul className="criteria-list">
        <li>The meeting occurred remotely (virtually)</li>
        <li>The meeting occurred within the last 30 days</li>
        <li>The meeting contained 3 or more people (at least two other people in addition to you)</li>
        <li>The other attendees spoke during the meeting</li>
        <li>The other attendees had their cameras on during the meeting</li>
      </ul>
      <p className="slide-text" style={{ marginTop: 28 }}>
        Next, we are going to ask you questions about the meeting.
      </p>
    </SlideScreen>
  );
}
