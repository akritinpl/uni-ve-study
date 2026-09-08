"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import {
  EASE,
  RevealRow,
  REVEAL_ROW_KEYFRAMES,
  badgeForFlag,
  buildRevealsForSlide,
  participantFlag,
  type ConsultantReveal,
} from "@/components/ui/RevealPieces";
import { CONSULTANTS, CONSULTANT_META, type ConsultantName } from "@/lib/consultants";
import type { ConsultantData, Ratings } from "@/lib/matching";
import { SUGGESTIONS } from "@/lib/suggestions";

const META = CONSULTANT_META;
const CARD_EASE = "cubic-bezier(.16,1,.3,1)";

type RevealPreziScreenProps = {
  pRes: Ratings;
  pStrongRec: [number, number] | null;
  pWeakRec: [number, number] | null;
  consultantData: Record<ConsultantName, ConsultantData>;
  onContinue: () => void;
  // navigates to the previous route (reveal-intro). Used by the Previous
  // button when on the first card, where there's no earlier card to go to.
  onBack: () => void;
  // consultant to visually highlight in the reveal rows, e.g. when arriving
  // here from clicking that consultant's agreement % on the previous screen.
  highlightConsultant?: ConsultantName | null;
};

const T_STATEMENT = 120; // statement fade-in
const T_YOU = 350; // gap before "you" rating appears
const T_PER_CONSULTANT = 380; // gap between each consultant reveal

// How far (in card-slots) either side of the active card to render — enough
// to see the next/prev card peeking in 3D without mounting all 10 at once.
const WINDOW = 2;

export default function RevealPreziScreen({
  pRes,
  pStrongRec,
  pWeakRec,
  consultantData,
  onContinue,
  onBack,
  highlightConsultant,
}: RevealPreziScreenProps) {
  const [index, setIndex] = useState(0);
  // Phones need taller cards + tighter padding so multi-line consultant
  // quotes fit without being clipped by the card's overflow:hidden.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  // Whether the current card should skip the staged reveal animation
  // entirely (true once a card has already been shown before — Previous,
  // or a progress-dot / peek-card jump back to it should just display
  // everything immediately, no replay).
  const [instant, setInstant] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0); // 0 = only statement, 1 = +you, 2.. = +consultants
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  // Cards the participant has already fully seen.
  const visited = useRef<Set<number>>(new Set([0]));
  const total = SUGGESTIONS.length;
  const isLast = index === total - 1;
  const suggestion = SUGGESTIONS[index];
  const reveals = useMemo(
    () => buildRevealsForSlide(suggestion.recId, consultantData),
    [suggestion.recId, consultantData],
  );
  const pFlag = useMemo(
    () => participantFlag(suggestion.recId, pRes[suggestion.recId], pStrongRec, pWeakRec),
    [suggestion.recId, pRes, pStrongRec, pWeakRec],
  );
  const maxRevealed = 1 + CONSULTANTS.length; // you + each consultant
  const displayedRevealedCount = instant ? maxRevealed : revealedCount;
  const fullyRevealed = displayedRevealedCount >= maxRevealed;

  // Kicks off a staged reveal animation timeline (not a derived value), so
  // resetting state here and stepping it via setTimeout is intentional.
  useEffect(() => {
    if (instant) return;
    setRevealedCount(0); // eslint-disable-line react-hooks/set-state-in-effect
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = T_STATEMENT + T_YOU;
    timers.push(setTimeout(() => setRevealedCount(1), t));
    for (let i = 0; i < CONSULTANTS.length; i++) {
      t += T_PER_CONSULTANT;
      timers.push(setTimeout(() => setRevealedCount(2 + i), t));
    }
    return () => timers.forEach(clearTimeout);
  }, [index, instant]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(total - 1, target));
      if (clamped === index) return;
      // Moving forward past the active card is only allowed once its own
      // reveal animation has finished playing — going backward to an
      // already-seen card is always allowed.
      if (clamped > index && !fullyRevealed) return;
      setInstant(visited.current.has(clamped));
      visited.current.add(clamped);
      setIndex(clamped);
    },
    [fullyRevealed, index, total],
  );

  const goNext = useCallback(() => {
    if (!fullyRevealed) return;
    if (isLast) {
      onContinue();
    } else {
      goTo(index + 1);
    }
  }, [fullyRevealed, goTo, index, isLast, onContinue]);

  const goPrev = useCallback(() => {
    if (index === 0) {
      onBack();
      return;
    }
    goTo(index - 1);
  }, [goTo, index, onBack]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -6, ry: px * 8 });
  };
  const handleStageMouseLeave = () => setTilt({ rx: 0, ry: 0 });

  // Swipe-to-navigate for touch devices — mirrors goNext/goPrev.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 50;
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const slots: number[] = [];
  for (let i = index - WINDOW; i <= index + WINDOW; i++) {
    if (i >= 0 && i < total) slots.push(i);
  }

  return (
    <div
      className="screen"
      style={{
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
        padding: "40px 20px",
      }}
    >
      {/* progress header: dots centered, counter pinned right, in normal flow so it can never overlap the stage below */}
      <div style={{ position: "relative", width: "100%", maxWidth: 900, marginBottom: 24, minHeight: 20 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 7 }}>
          {SUGGESTIONS.map((s, i) => {
            return (
              <div
                key={s.recId}
                aria-label={`Statement ${i + 1}`}
                style={{
                  width: i === index ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: i === index ? "var(--accent)" : i < index ? "rgba(180,83,9,0.45)" : "var(--border)",
                  transition: `all 0.3s ${EASE}`,
                  padding: 0,
                }}
              />
            );
          })}
        </div>

        <div style={{ position: "absolute", top: 0, right: 4, fontSize: 12, color: "var(--text-2)" }}>
          {index + 1} / {total}
        </div>
      </div>

      {/* 3D stage */}
      <div
        ref={stageRef}
        onMouseMove={handleStageMouseMove}
        onMouseLeave={handleStageMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%",
          maxWidth: 900,
          height: isMobile ? 620 : 520,
          position: "relative",
          perspective: 1600,
          touchAction: "pan-y",
        }}
      >
        {slots.map((i) => {
          const offset = i - index;
          const isCurrent = offset === 0;
          const locked = offset > 0 && !fullyRevealed;
          return (
            <StageCard
              key={SUGGESTIONS[i].recId}
              offset={offset}
              tilt={isCurrent ? tilt : { rx: 0, ry: 0 }}
              locked={locked}
              isMobile={isMobile}
              onClick={() => (offset === 0 ? goNext() : goTo(i))}
            >
              {isCurrent ? (
                <CurrentCardContent
                  suggestion={suggestion}
                  index={index}
                  pRes={pRes}
                  pFlag={pFlag}
                  reveals={reveals}
                  revealedCount={displayedRevealedCount}
                  animate={!instant}
                  highlightConsultant={highlightConsultant}
                  isMobile={isMobile}
                />
              ) : (
                <PeekCardContent index={i} isMobile={isMobile} />
              )}
            </StageCard>
          );
        })}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 780,
          marginTop: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {index === 0 ? (
          <div />
        ) : (
          <button
            className="btn btn-outline btn-sm"
            onClick={goPrev}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </button>
        )}

        <p style={{ fontSize: 12, color: "var(--text-2)", margin: 0 }}>
          {fullyRevealed ? "Click the card, swipe, or press → / space" : "Watch how each consultant rated this…"}
        </p>

        <button
          className="btn btn-accent btn-sm"
          onClick={goNext}
          disabled={!fullyRevealed}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          {isLast ? "Continue" : "Next"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <style>{REVEAL_ROW_KEYFRAMES}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   3D STAGE CARD — positions itself in the stack based on
   its offset from the active card, and reacts to mouse tilt
   when active.
══════════════════════════════════════════════════════ */

function StageCard({
  offset,
  tilt,
  locked,
  isMobile,
  onClick,
  children,
}: {
  offset: number;
  tilt: { rx: number; ry: number };
  locked: boolean;
  isMobile: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const abs = Math.abs(offset);
  const isCurrent = offset === 0;

  const translateX = offset * 250;
  const translateZ = -abs * 200;
  const rotateY = offset * -28 + (isCurrent ? tilt.ry : 0);
  const rotateX = isCurrent ? tilt.rx : 0;
  const scale = isCurrent ? 1 : 1 - abs * 0.14;
  const opacity = abs > 2 ? 0 : (1 - abs * 0.32) * (locked ? 0.55 : 1);
  const blur = isCurrent ? 0 : abs * 1.5 + (locked ? 2 : 0);
  const zIndex = 10 - abs;

  return (
    <div
      onClick={locked ? undefined : onClick}
      style={{
        position: "absolute",
        inset: 0,
        margin: "auto",
        width: "min(640px, 100%)",
        height: isCurrent ? (isMobile ? 620 : 520) : isMobile ? 560 : 480,
        transformStyle: "preserve-3d",
        transform: `translate3d(${translateX}px, ${isCurrent ? 0 : 30}px, ${translateZ}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`,
        transition: `transform 0.4s ${CARD_EASE}, opacity 0.4s ${CARD_EASE}`,
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        zIndex,
        cursor: isCurrent ? "default" : locked ? "not-allowed" : "pointer",
        pointerEvents: abs > 2 ? "none" : "auto",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 22,
          height: "100%",
          boxShadow: isCurrent
            ? "0 30px 60px -12px rgba(0,0,0,0.25), 0 12px 24px -8px rgba(0,0,0,0.12)"
            : "0 20px 40px -10px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CURRENT CARD — full statement + reveal rows
══════════════════════════════════════════════════════ */

function CurrentCardContent({
  suggestion,
  index,
  pRes,
  pFlag,
  reveals,
  revealedCount,
  animate,
  highlightConsultant,
  isMobile,
}: {
  suggestion: (typeof SUGGESTIONS)[number];
  index: number;
  pRes: Ratings;
  pFlag: "strong" | "weak" | null;
  reveals: ConsultantReveal[];
  revealedCount: number;
  animate: boolean;
  highlightConsultant?: ConsultantName | null;
  isMobile: boolean;
}) {
  // If any consultant on this card has a quote, every row (including "You")
  // uses the compact quote-card sizing so the whole card looks consistent
  // rather than mixing big and small rows.
  const dense = reveals.some((rv) => !!rv.quote);
  return (
    <div
      style={{
        padding: isMobile ? "24px 22px" : "36px 48px",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: 14,
        }}
      >
        Statement {index + 1}
      </span>
      <p
        style={{
          fontFamily: "var(--fd)",
          fontSize: "clamp(1.2rem, 2.3vw, 1.55rem)",
          lineHeight: 1.5,
          color: "var(--text)",
          margin: 0,
          width: "100%",
          textWrap: "balance" as React.CSSProperties["textWrap"],
        }}
      >
        &ldquo;{suggestion.text}&rdquo;
      </p>

      <div
        style={{
          marginTop: 22,
          marginLeft: 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: dense ? 14 : 28,
          flex: 1,
        }}
      >
        <RevealRow
          show={revealedCount >= 1}
          animate={animate}
          label="You"
          labelColor="var(--text)"
          endorsed={pRes[suggestion.recId]}
          avatarInit="You"
          avatarColor="var(--text)"
          dense={dense}
          badge={
            pFlag === "strong"
              ? { text: "Your strongest", icon: "▲", color: "var(--success)" }
              : pFlag === "weak"
              ? { text: "Your weakest", icon: "▼", color: "var(--danger)" }
              : null
          }
        />
        {reveals.map((rv, i) => {
          const meta = META[rv.name];
          return (
            <RevealRow
              key={rv.name}
              show={revealedCount >= 2 + i}
              animate={animate}
              label={rv.name}
              labelColor={meta.color}
              endorsed={rv.endorsed}
              quote={rv.quote}
              dense={dense}
              avatarInit={meta.init}
              avatarColor={meta.color}
              badge={badgeForFlag(rv.flag, meta.color, `${meta.short}'s top pick`, `${meta.short}'s bottom pick`)}
              highlighted={rv.name === highlightConsultant}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PEEK CARD — simplified preview shown for neighboring
   (not-yet-active) cards in the 3D stack
══════════════════════════════════════════════════════ */

function PeekCardContent({ index, isMobile }: { index: number; isMobile: boolean }) {
  const s = SUGGESTIONS[index];
  return (
    <div
      style={{
        padding: isMobile ? "26px 24px" : "40px 42px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-2)",
          marginBottom: 14,
        }}
      >
        Statement {index + 1}
      </span>
      <p
        style={{
          fontFamily: "var(--fd)",
          fontSize: "1.15rem",
          lineHeight: 1.55,
          color: "var(--text-2)",
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 6,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        &ldquo;{s.text}&rdquo;
      </p>
    </div>
  );
}

