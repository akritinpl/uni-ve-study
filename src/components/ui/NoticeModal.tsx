"use client";

export default function NoticeModal({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <p className="modal-text">{message}</p>
        <button type="button" className="btn btn-accent btn-sm" onClick={onDismiss}>
          Okay
        </button>
      </div>
    </div>
  );
}
