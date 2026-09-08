"use client";

// Shared layout for plain, text-forward slides (intros, brief pages, thank
// you): centered paragraphs on the flat study background, matching the
// reference screenshot's look, with any text entry rendered as a simple box
// beneath the copy rather than boxed-up together in a card.
type SlideScreenProps = {
  // Large display-font title, e.g. for a page's opening line. Optional —
  // most slides are all body copy with no title.
  title?: React.ReactNode;
  lines: React.ReactNode[];
  children?: React.ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  // Greys the continue button out like continueDisabled, but keeps it
  // clickable — for cases where onContinue itself decides what to do with
  // an incomplete answer (e.g. show a validation popup) rather than the
  // button silently refusing to respond.
  continueMuted?: boolean;
  submitting?: boolean;
  align?: "center" | "left";
  // Anchors the content block near the top instead of dead-center — for
  // short slides that would otherwise look adrift after a taller one above.
  justify?: "center" | "top";
  // Extra class on the inner content wrapper, for one-off layout tweaks that
  // shouldn't affect every align="left" slide.
  innerClassName?: string;
};

export default function SlideScreen({
  title,
  lines,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  continueMuted = false,
  submitting = false,
  align = "center",
  justify = "center",
  innerClassName = "",
}: SlideScreenProps) {
  return (
    <div className={`screen screen-slide ${justify === "top" ? "justify-top" : ""}`}>
      <div
        className={`slide-inner ${align === "left" ? "align-left" : ""} ${title ? "has-title" : ""} ${innerClassName}`}
      >
        {title && <h1 className="slide-title">{title}</h1>}
        {lines.map((line, i) => (
          <p className="slide-text" key={i}>
            {line}
          </p>
        ))}
        {children}
        {(onBack || onContinue) && (
          <div className="slide-nav" style={onBack ? { justifyContent: "space-between" } : undefined}>
            {onBack && (
              <button type="button" className="btn btn-outline btn-sm" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
            )}
            {onContinue && (
              <button
                type="button"
                className="btn btn-accent btn-lg"
                onClick={onContinue}
                disabled={continueDisabled || submitting}
                style={continueMuted ? { opacity: 0.5 } : undefined}
              >
                {submitting ? "Saving…" : continueLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
