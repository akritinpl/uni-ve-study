-- Responses from the specific-meeting-* flow (the participant recalls one
-- particular recent virtual meeting and answers questions about it). One row
-- per participant, filled in incrementally as they move through the flow's
-- several pages — see handleSpecificMeetingSave in lib/study-context.tsx.

create table if not exists specific_meeting (
  participant_id uuid primary key references irb_consent (participant_id) on delete cascade,

  -- specific-meeting-questions
  recurring text check (recurring in ('recurring', 'one-off')),
  day_of_week text,
  memory_strength smallint check (memory_strength between 1 and 7),
  attendee1 text,
  attendee2 text,

  -- specific-meeting-followup
  had_agenda boolean,
  started_on_time boolean,
  productivity smallint check (productivity between 1 and 7),
  productivity_reason text,

  -- specific-meeting-gaze / specific-meeting-gaze-2
  gaze_listening smallint check (gaze_listening between 1 and 7),
  gaze_speaking smallint check (gaze_speaking between 1 and 7),

  -- specific-meeting-impressions: { [itemKey]: 1-7 }, keys are the item ids
  -- from IMPRESSION_ITEMS/RECEPTION_ITEMS/STATUS_ITEMS/SHOULD_ITEMS in
  -- components/screens/SpecificMeetingImpressions.tsx
  impressions jsonb,

  created_at timestamptz not null default now()
);

alter table specific_meeting enable row level security;
