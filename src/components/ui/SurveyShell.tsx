type SurveyShellProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  page: number;
  totalPages: number;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  // true while onNext triggered a network save that hasn't resolved yet —
  // shows a "Saving…" state instead of the button looking inert.
  submitting?: boolean;
  wide?: boolean;
  solidProgress?: boolean;
  children: React.ReactNode;
};

export default function SurveyShell({
  eyebrow,
  title,
  subtitle,
  page,
  totalPages,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  submitting = false,
  wide = false,
  solidProgress = false,
  children,
}: SurveyShellProps) {
  return (
    <div className="screen survey-screen">
      <div className={`survey-container ${wide ? "wide" : ""}`}>
        <div className="survey-eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {subtitle && <p className="survey-sub">{subtitle}</p>}
        <div className="progress-wrap">
          <div
            className="progress-fill"
            style={{ width: solidProgress ? "100%" : `${((page + 1) / totalPages) * 100}%` }}
          />
        </div>

        {children}

        <div className="survey-nav">
          <span />
          <div className="page-dots">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`dot ${i === page ? "cur" : i < page ? "done" : ""}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn btn-accent btn-sm"
            onClick={onNext}
            disabled={nextDisabled || submitting}
          >
            {submitting ? "Saving…" : nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
