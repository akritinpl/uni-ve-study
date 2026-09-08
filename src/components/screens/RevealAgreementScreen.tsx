"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { CONSULTANTS, CONSULTANT_META, type ConsultantName } from "@/lib/consultants";
import { agreementPct, type ConsultantData, type Ratings } from "@/lib/matching";

const EASE = "cubic-bezier(.22,.61,.36,1)";

function simPct(
  name: ConsultantName,
  pRes: Ratings,
  consultantData: Record<ConsultantName, ConsultantData>,
): number {
  return agreementPct(pRes, consultantData[name].ratings);
}

export default function RevealAgreementScreen({
  pRes,
  consultantData,
  onContinue,
  onBack,
  onSelectConsultant,
}: {
  pRes: Ratings;
  consultantData: Record<ConsultantName, ConsultantData>;
  onContinue: () => void;
  onBack: () => void;
  onSelectConsultant?: (name: ConsultantName) => void;
}) {
  const [phase, setPhase] = useState<"loading" | "summary">("loading");

  return (
    <div className="screen survey-screen" style={{ alignItems: "stretch", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 660, margin: "0 auto" }}>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "24px 28px",
            minHeight: 320,
          }}
        >
          {phase === "loading" ? (
            <LoadingPhase onDone={() => setPhase("summary")} />
          ) : (
            <SummaryPhase
              pRes={pRes}
              consultantData={consultantData}
              onContinue={onContinue}
              onBack={onBack}
              onSelectConsultant={onSelectConsultant}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LOADING PHASE — brief "calculating results" animation
   before the agreement summary is revealed.
══════════════════════════════════════════════════════ */

const LOAD_STEPS = [
  { text: "Saving your responses", dwell: 800 },
  { text: "Comparing your responses to the consultants", dwell: 1100 },
  { text: "Comparison complete", dwell: 600, done: true },
];

function LoadingPhase({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState<number[]>([]);
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 300;
    LOAD_STEPS.forEach((step, i) => {
      timers.push(setTimeout(() => setVisible((v) => [...v, i]), t));
      if (!step.done) {
        timers.push(setTimeout(() => setChecked((c) => [...c, i]), t + step.dwell));
      } else {
        timers.push(setTimeout(() => setChecked((c) => [...c, i]), t + 300));
      }
      t += step.dwell;
    });
    timers.push(setTimeout(onDone, t + 400));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      style={{
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spinner />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "flex-start",
          marginTop: 28,
          minHeight: 90,
        }}
      >
        {LOAD_STEPS.map((step, i) => {
          const show = visible.includes(i);
          const done = checked.includes(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 15,
                color: done ? "var(--text-3, var(--text-2))" : "var(--text-2)",
                opacity: show ? 1 : 0,
                filter: show ? "blur(0)" : "blur(6px)",
                transform: show ? "translateY(0)" : "translateY(4px)",
                transition: `opacity 1s ${EASE}, filter 1s ${EASE}, transform 1s ${EASE}`,
              }}
            >
              <span style={{ width: 18, display: "inline-flex", justifyContent: "center", flexShrink: 0 }}>
                {done ? (
                  <CheckIcon color="var(--success)" />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border)", display: "inline-block" }} />
                )}
              </span>
              <span>
                {step.text}
                {!step.done && !done ? "…" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="36" height="36" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="31 94"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="-90 25 25"
          to="270 25 25"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   SUMMARY PHASE
══════════════════════════════════════════════════════ */

function SummaryPhase({
  pRes,
  consultantData,
  onContinue,
  onBack,
  onSelectConsultant,
}: {
  pRes: Ratings;
  consultantData: Record<ConsultantName, ConsultantData>;
  onContinue: () => void;
  onBack: () => void;
  onSelectConsultant?: (name: ConsultantName) => void;
}) {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    CONSULTANTS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible((v) => [...v, i]), 80 + i * 90));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div>
      <h2 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.3rem,3vw,1.9rem)" }}>
        How each consultant compared to you
      </h2>
      <p style={{ color: "var(--text-2)", fontSize: 15, marginTop: 10, marginBottom: 10, lineHeight: 1.6 }}>
        Each consultant reviewed the same 10 suggestions you did. Here’s how often their
        ratings matched yours. 
      </p>
      <p style={{ color: "var(--text-2)", fontSize: 13.5, marginBottom: 22, lineHeight: 1.6 }}>
        Note: We replaced the consultants’ real names with pseudo-
        names to protect their identities.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CONSULTANTS.map((name, i) => {
          const meta = CONSULTANT_META[name];
          const pct = simPct(name, pRes, consultantData);
          const show = visible.includes(i);
          return (
            <div
              key={name}
              role={onSelectConsultant ? "button" : undefined}
              tabIndex={onSelectConsultant ? 0 : undefined}
              onClick={onSelectConsultant ? () => onSelectConsultant(name) : undefined}
              onKeyDown={
                onSelectConsultant
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectConsultant(name);
                      }
                    }
                  : undefined
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${meta.color}`,
                borderRadius: 12,
                background: "var(--surface)",
                opacity: show ? 1 : 0,
                filter: show ? "blur(0)" : "blur(6px)",
                transform: show ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.5s ${EASE}, filter 0.5s ${EASE}, transform 0.5s ${EASE}, box-shadow 0.2s`,
                cursor: onSelectConsultant ? "pointer" : undefined,
              }}
            >
              <Avatar init={meta.init} color={meta.color} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 7px", color: "var(--text)" }}>
                  {name}
                </p>
                <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: meta.color, borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 20, fontWeight: 500, margin: "0 0 2px", color: meta.color }}>{pct}%</p>
                <p style={{ fontSize: 11, color: "var(--text-2)", margin: 0 }}>similar ratings</p>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <button className="btn btn-accent" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
