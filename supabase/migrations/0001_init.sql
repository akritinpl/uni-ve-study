-- Virtual meetings study: schema for consent, pre-task, suggestion bank,
-- task (ratings/rankings + generated consultant endorsements), and post-task survey.
-- All tables have RLS enabled with no policies: only the service_role key
-- (used server-side in API routes) can read/write. The anon key has no access.

create extension if not exists "pgcrypto";

create table if not exists irb_consent (
  participant_id uuid primary key default gen_random_uuid(),
  irb_consented boolean not null,
  created_at timestamptz not null default now()
);

alter table irb_consent enable row level security;

create table if not exists pre_task (
  participant_id uuid primary key references irb_consent (participant_id) on delete cascade,
  pre_task_change text,
  created_at timestamptz not null default now()
);

alter table pre_task enable row level security;

-- Static bank of the 10 employee suggestions shown to every participant.
create table if not exists survey_rec (
  rec_id smallint primary key,
  suggestion text not null
);

alter table survey_rec enable row level security;

-- One row per participant: their thumbs up/down + top/bottom 2 picks on the
-- 10 suggestions, the 3 consultants' generated endorsements derived from
-- those ratings (see lib/matching.ts), and the post-reveal time allocation.
create table if not exists task (
  participant_id uuid primary key references irb_consent (participant_id) on delete cascade,
  p_res jsonb not null, -- { [rec_id]: boolean } participant agree/disagree, 10 entries
  p_strong_rec smallint[] not null, -- top 2 rec_ids
  p_weak_rec smallint[] not null, -- bottom 2 rec_ids
  c_res jsonb not null, -- { [consultantName]: { [rec_id]: boolean } }, 3 consultants
  c_strong_rec jsonb not null, -- { [consultantName]: smallint[2] }
  c_weak_rec jsonb not null, -- { [consultantName]: smallint[2] }
  time_c jsonb, -- { [consultantName]: number }, filled in later, must sum to 10
  created_at timestamptz not null default now(),
  constraint p_strong_rec_len check (array_length(p_strong_rec, 1) = 2),
  constraint p_weak_rec_len check (array_length(p_weak_rec, 1) = 2)
);

alter table task enable row level security;

create table if not exists post_task_vm (
  participant_id uuid primary key references irb_consent (participant_id) on delete cascade,
  refined_rec text, -- revised/expanded/new recommendation after seeing the reveal
  frustration text, -- Post_VMNeg
  satisfaction text, -- Post_VMPos
  would_change text, -- Post_VMChange
  created_at timestamptz not null default now()
);

alter table post_task_vm enable row level security;
