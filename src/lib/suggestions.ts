export type Suggestion = {
  recId: number;
  text: string;
};

// Canonical content for the 10-suggestion bank. Mirrored in
// supabase/seed/0001_survey_rec.sql so the database has matching rows for
// the rec_ids referenced by task.p_strong_rec / p_weak_rec / c_strong_rec / c_weak_rec.
export const SUGGESTIONS: Suggestion[] = [
  {
    recId: 1,
    text: "Ask attendees to turn their cameras off during virtual meetings.",
  },
  {
    recId: 2,
    text: "Designate one full day per week as meeting-free.",
  },
  {
    recId: 3,
    text: "Use strict time limits for each person’s speaking turns.",
  },
  {
    recId: 4,
    text: "Begin virtual meetings with personal check-in time, where each participant shares something non work-related to build rapport.",
  },
  {
    recId: 5,
    text: "Allow an AI assistant to interrupt the meeting when it detects an unresolved disagreement or unanswered question.",
  },
  {
    recId: 6,
    text: "Record every virtual meeting and make the recording available to anyone in the company.",
  },
  {
    recId: 7,
    text: "Have the most junior participant speak first when the group is making a decision.",
  },
  {
    recId: 8,
    text: "Limit virtual meetings to three participants unless the organizer provides a reason for including more people.",
  },
  {
    recId: 9,
    text: "Require every attendee to speak at least once during the meeting.",
  },
  {
    recId: 10,
    text: "Designate roles before the meeting starts (e.g., notetaker, chat facilitator, devil's advocate, etc.).",
  },
];
