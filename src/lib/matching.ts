import { CONSULTANTS, type ConsultantName } from "./consultants";
import { seededRandom, shuffle } from "./rng";
import { SUGGESTIONS } from "./suggestions";

export type Ratings = Record<number, boolean>;

export type ConsultantRole = "match" | "opposite";

export type ConsultantData = {
  role: ConsultantRole;
  ratings: Ratings;
  strongRec: [number, number] | null;
  weakRec: [number, number] | null;
};

const ALL_REC_IDS = SUGGESTIONS.map((s) => s.recId);

// Number of suggestions (out of ALL_REC_IDS.length) each role flips relative
// to the participant's own ratings, expressed as an inclusive [min, max]
// range. With 10 suggestions, agreement moves in 10% steps, so these ranges
// translate to roughly: match 90-100% agreement, opposite 10-40% agreement.
const FLIP_COUNT_RANGE: Record<ConsultantRole, [number, number]> = {
  match: [0, 1],
  opposite: [6, 9],
};

function randomFlipCount(role: ConsultantRole, random: () => number): number {
  const [min, max] = FLIP_COUNT_RANGE[role];
  return min + Math.floor(random() * (max - min + 1));
}

// Builds the set of recIds this role flips relative to the participant's own
// ratings. The participant's own strong/weak pick (both sides combined) is
// treated specially so a random flip can never strip the match consultant of
// its guaranteed top/bottom 2, or leave the opposite consultant without its
// (swapped) top/bottom 2:
//   - match wants ratings[id] === participantSaidYes[id] on these ids (i.e.
//     unflipped), since its strong/weak preference is the participant's own
//     pick as-is — so these ids are excluded from its flip pool entirely.
//   - opposite wants ratings[id] === !participantSaidYes[id] on these ids
//     (i.e. flipped), since its strong/weak preference is the participant's
//     pick swapped — so these ids are always included in its flip set.
// FLIP_COUNT_RANGE.opposite's minimum (6) is comfortably above the largest
// possible forced set (4: 2 strong + 2 weak), so forcing them never pushes
// the total flip count below its intended range.
function buildFlipSet(
  role: ConsultantRole,
  participantStrongRec: [number, number] | null,
  participantWeakRec: [number, number] | null,
  random: () => number,
): Set<number> {
  const preferredIds = [...(participantStrongRec ?? []), ...(participantWeakRec ?? [])];
  const flipCount = randomFlipCount(role, random);

  if (role === "match") {
    const pool = shuffle(
      ALL_REC_IDS.filter((id) => !preferredIds.includes(id)),
      random,
    );
    return new Set(pool.slice(0, flipCount));
  }

  const extraCount = Math.max(0, flipCount - preferredIds.length);
  const pool = shuffle(
    ALL_REC_IDS.filter((id) => !preferredIds.includes(id)),
    random,
  );
  return new Set([...preferredIds, ...pool.slice(0, extraCount)]);
}

// Picks 2 recIds matching `wantEndorsed` against this consultant's actual
// (already-flipped) ratings, trying `preferred` first and falling back to any
// other recId with a matching rating. This keeps strongRec/weakRec — the
// consultant's own top 2 / bottom 2 picks — always consistent with the
// endorse/decline rating shown for those same suggestions, without touching
// the flip pattern that drives the role's overall agreement rate.
//
// A heavily one-sided flip pattern (e.g. a near-unanimous participant paired
// with a small flip count) can leave fewer than 2 recIds with the wanted
// rating. Rather than inventing a pick, that means this consultant has no
// genuine top/bottom 2 to report — return null so the caller skips showing
// that comment instead of fabricating one.
function pickTwoWithRating(
  preferred: number[],
  ratings: Ratings,
  wantEndorsed: boolean,
): [number, number] | null {
  const picked: number[] = [];
  for (const recId of [...preferred, ...ALL_REC_IDS]) {
    if (picked.length === 2) break;
    if (picked.includes(recId)) continue;
    if (ratings[recId] === wantEndorsed) picked.push(recId);
  }
  if (picked.length < 2) return null;
  return [picked[0], picked[1]];
}

/**
 * Generates each of the 2 consultants' endorsement pattern from a single
 * participant's ratings: one consultant mostly matches the participant
 * (~90-100% agreement) and the other mostly opposes them (~10-40%
 * agreement). The exact agreement rate within each range, and which named
 * consultant plays which role, are both randomized per participant (seeded
 * by participant_id) so the same role isn't always "Taylor" and agreement
 * isn't always the same percentage.
 *
 * Top 2 / bottom 2 picks stay as close as possible to the participant's own
 * picks: the matching consultant prefers the same top 2 and bottom 2, the
 * opposite consultant prefers them swapped — but in every case the pick is
 * constrained to recIds this consultant actually endorsed/declined, so a
 * "top pick" is never shown next to a thumbs-down and vice versa.
 */
export function generateConsultantData(
  participantId: string,
  participantRatings: Ratings,
  participantStrongRec: [number, number] | null,
  participantWeakRec: [number, number] | null,
): Record<ConsultantName, ConsultantData> {
  const random = seededRandom(participantId);
  const roles = shuffle<ConsultantRole>(["match", "opposite"], random);
  const flipSetForRole: Record<ConsultantRole, Set<number>> = {
    match: buildFlipSet("match", participantStrongRec, participantWeakRec, random),
    opposite: buildFlipSet("opposite", participantStrongRec, participantWeakRec, random),
  };

  const result = {} as Record<ConsultantName, ConsultantData>;

  CONSULTANTS.forEach((consultant, i) => {
    const role = roles[i];
    const ratings: Ratings = {};
    const flipSet = flipSetForRole[role];

    for (const recId of ALL_REC_IDS) {
      const participantSaidYes = participantRatings[recId];
      ratings[recId] = flipSet.has(recId) ? !participantSaidYes : participantSaidYes;
    }

    const strongPreferred = (role === "match" ? participantStrongRec : participantWeakRec) ?? [];
    const weakPreferred = (role === "match" ? participantWeakRec : participantStrongRec) ?? [];
    const strongRec = pickTwoWithRating(strongPreferred, ratings, true);
    const weakRec = pickTwoWithRating(weakPreferred, ratings, false);

    result[consultant] = { role, ratings, strongRec, weakRec };
  });

  return result;
}

// Share of the 10 suggestions where this consultant's rating matches the
// participant's own rating, as a whole-number percentage (0-100).
export function agreementPct(participantRatings: Ratings, consultantRatings: Ratings): number {
  const n = ALL_REC_IDS.filter((recId) => consultantRatings[recId] === participantRatings[recId]).length;
  return Math.round((100 * n) / ALL_REC_IDS.length);
}
