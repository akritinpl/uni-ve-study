"use client";

import { usePathname } from "next/navigation";
import { STEP_ORDER, type Step } from "@/lib/study-context";

// Hidden only on the welcome screen — nothing to show progress toward yet.
const HIDDEN_STEPS: Step[] = ["welcome"];

export default function StudyProgressBar() {
  const pathname = usePathname();
  const step = pathname?.slice(1) as Step | undefined;
  const index = step ? STEP_ORDER.indexOf(step) : -1;

  if (index === -1 || HIDDEN_STEPS.includes(step as Step)) return null;

  const pct = Math.round((index / (STEP_ORDER.length - 1)) * 100);

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 20,
        display: "flex",
        alignItems: "center",
        gap: 8,
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: 120,
          height: 4,
          borderRadius: 2,
          background: "var(--border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--accent)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
    </div>
  );
}
