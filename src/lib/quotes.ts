import { seededRandom } from "./rng";

const ENDORSE_QUOTES = [
  "I support this recommendation. This is a sound practice that organizations should seriously consider adopting.",
  "I agree this suggestion has real value. I would recommend this practice to the teams I work with.",
  "This is a solid, practical idea. I'd encourage any team I advise to put it into practice.",
  "I think this suggestion holds up well in practice. It's worth prioritizing.",
];

const DECLINE_QUOTES = [
  "I don't see this as a strong recommendation. I would not prioritize this suggestion for the organizations I advise.",
  "This doesn't strike me as realistic in most workplace settings. I wouldn't push for it.",
  "I'm not convinced this would meaningfully improve things. I'd deprioritize it.",
  "This isn't a suggestion I'd recommend teams act on right now.",
];

/** Deterministic per (consultant, suggestion) so the reveal page shows a stable quote on reload without persisting it. */
export function quoteFor(consultantName: string, recId: number, endorsed: boolean): string {
  const pool = endorsed ? ENDORSE_QUOTES : DECLINE_QUOTES;
  const random = seededRandom(`${consultantName}:${recId}:${endorsed}`);
  const index = Math.floor(random() * pool.length);
  return pool[index];
}
