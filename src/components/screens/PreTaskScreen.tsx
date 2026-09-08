"use client";

import SlideScreen from "@/components/ui/SlideScreen";

type PreTaskScreenProps = {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  onBack: () => void;
  // true once /api/pre-task has already succeeded for this participant.
  locked?: boolean;
  // true while the pre-task POST is in flight.
  submitting?: boolean;
};

export default function PreTaskScreen({
  value,
  onChange,
  onContinue,
  onBack,
  locked = false,
  submitting = false,
}: PreTaskScreenProps) {
  return (
    <SlideScreen
      align="left"
      lines={[
        "We are going to ask you to look at (and rate) suggestions for improving virtual meetings.",
        "But before seeing them, we want to hear from you.",
        "If you could change one thing to improve the virtual meetings that you attend, what would it be? What would you modify? Briefly describe it in this textbox (one or two sentences is fine).",
      ]}
      onBack={onBack}
      onContinue={onContinue}
      submitting={submitting}
    >
      {locked ? (
        <p className="slide-locked-text">{value || <em>(left blank)</em>}</p>
      ) : (
        <textarea
          className="slide-textarea slide-textarea-blend"
          placeholder="One thing I'd change about my virtual meetings is..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <p className="slide-text" style={{ marginTop: 20 }}>
        If you have zero ideas, that&rsquo;s okay. You can leave it blank and continue.
      </p>
    </SlideScreen>
  );
}
