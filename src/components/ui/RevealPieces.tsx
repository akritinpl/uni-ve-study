import Avatar from "@/components/ui/Avatar";
import { CONSULTANTS, type ConsultantName } from "@/lib/consultants";
import type { ConsultantData, Ratings } from "@/lib/matching";
import { quoteFor } from "@/lib/quotes";

// Shared visual language for the reveal-prezi screen's staged reveal.

export const EASE = "cubic-bezier(.22,.61,.36,1)";

export function ThumbUp({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", flexShrink: 0 }}>
      <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

export function ThumbDown({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", flexShrink: 0 }}>
      <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

export function Thumb({ endorsed, color, size }: { endorsed: boolean; color: string; size?: number }) {
  return endorsed ? <ThumbUp color={color} size={size} /> : <ThumbDown color={color} size={size} />;
}

// Each consultant's rating + quote (if this suggestion is one of their own
// top/bottom 2 picks) for a given statement.
export type ConsultantReveal = {
  name: ConsultantName;
  endorsed: boolean;
  quote: string | null;
  flag: "strong" | "weak" | null;
};

export function buildRevealsForSlide(
  recId: number,
  consultantData: Record<ConsultantName, ConsultantData>,
): ConsultantReveal[] {
  return CONSULTANTS.map((name) => {
    const data = consultantData[name];
    const endorsed = data.ratings[recId];
    const flag = data.strongRec?.includes(recId) ? "strong" : data.weakRec?.includes(recId) ? "weak" : null;
    return {
      name,
      endorsed,
      quote: flag !== null ? quoteFor(name, recId, endorsed) : null,
      flag,
    };
  });
}

// Participant's own top 2 / bottom 2 pick for this statement. When the
// participant had only 1 genuine thumbs-up/down on a side, pStrongRec/
// pWeakRec duplicate that single id into both slots rather than padding
// with an unrelated one, so the rating check below still only flags a
// participant's real pick.
export function participantFlag(
  recId: number,
  rating: boolean,
  pStrongRec: [number, number] | null,
  pWeakRec: [number, number] | null,
): "strong" | "weak" | null {
  if (pStrongRec?.includes(recId) && rating === true) return "strong";
  if (pWeakRec?.includes(recId) && rating === false) return "weak";
  return null;
}

type RowBadge = { text: string; icon: string; color: string } | null;

export function badgeForFlag(
  flag: "strong" | "weak" | null,
  color: string,
  strongText: string,
  weakText: string,
): RowBadge {
  if (flag === "strong") return { text: strongText, icon: "★", color };
  if (flag === "weak") return { text: weakText, icon: "☆", color };
  return null;
}

export function RevealRow({
  show,
  animate,
  label,
  labelColor,
  endorsed,
  quote,
  avatarInit,
  avatarColor,
  badge,
  highlighted,
  dense = !!quote,
}: {
  show: boolean;
  animate: boolean;
  label: string;
  labelColor: string;
  endorsed: boolean;
  quote?: string | null;
  avatarInit: string;
  avatarColor: string;
  badge?: RowBadge;
  highlighted?: boolean;
  // Whether this row should use the compact (quote-card) sizing rather than
  // the larger no-quote sizing. Defaults to whether this row itself has a
  // quote, but a parent showing a mix of quote/no-quote rows in the same
  // card should pass this explicitly so every row in that card matches.
  dense?: boolean;
}) {
  const thumbColor = endorsed ? "var(--success)" : "var(--danger)";
  const avatarSize = dense ? 32 : 40;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 5,
        flexShrink: 0,
        opacity: show ? 1 : 0,
        animation: show && animate ? `reveal-row-in 0.35s ${EASE}` : undefined,
        visibility: show ? "visible" : "hidden",
        minHeight: dense ? 58 : 44,
        padding: highlighted ? "10px 10px" : dense ? "10px 0" : "4px 0",
        marginLeft: highlighted ? -10 : 0,
        borderRadius: 10,
        background: highlighted ? `color-mix(in srgb, ${labelColor} 10%, transparent)` : undefined,
        boxShadow: highlighted ? `0 0 0 1px color-mix(in srgb, ${labelColor} 35%, transparent)` : undefined,
        transition: "background 0.3s, box-shadow 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 6, gap: 14 }}>
        <Avatar init={avatarInit === "You" ? "Y" : avatarInit} color={avatarColor} size={avatarSize} />
        <span
          style={{
            fontSize: dense ? 14 : 17,
            fontWeight: 500,
            color: labelColor,
            minWidth: 0,
            maxWidth: "100%",
            overflowWrap: "break-word",
            flexShrink: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: endorsed ? "var(--success-bg)" : "var(--danger-bg)",
            border: `1px solid ${endorsed ? "var(--success-border)" : "var(--danger-border)"}`,
            flexShrink: 0,
          }}
        >
          <Thumb endorsed={endorsed} color={thumbColor} />
        </span>
        {badge && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: badge.color,
              background: `color-mix(in srgb, ${badge.color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${badge.color} 35%, transparent)`,
              borderRadius: 100,
              padding: "3px 9px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {badge.icon} {badge.text}
          </span>
        )}
      </div>
      {quote && (
        <p
          style={{
            fontSize: 15.5,
            fontStyle: "italic",
            color: "var(--text-2)",
            lineHeight: 1.6,
            margin: "4px 0 0 46px",
            textWrap: "balance" as React.CSSProperties["textWrap"],
          }}
        >
          &ldquo;{quote}&rdquo;
        </p>
      )}
    </div>
  );
}

export const REVEAL_ROW_KEYFRAMES = `
  @keyframes reveal-row-in {
    from { opacity: 0; transform: translateX(-12px); filter: blur(4px); }
    to { opacity: 1; transform: translateX(0); filter: blur(0); }
  }
`;

export type { Ratings };
