-- Demographic questions shown as the last step of the survey, before the
-- thank-you page. One row per participant.

create table if not exists demographics (
  participant_id uuid primary key references irb_consent (participant_id) on delete cascade,
  age smallint,
  sex text check (sex in ('Male', 'Female')),
  education text check (education in (
    'Less than high school',
    'High school graduate',
    'Some college',
    '2 year degree',
    '4 year degree',
    'Professional degree',
    'Doctorate'
  )),
  meetings_per_week smallint,
  work_arrangement text check (work_arrangement in ('Fully remote', 'Fully on-site/in-office', 'Hybrid')),
  years_at_job smallint,
  professional_level text check (professional_level in (
    'Entry level',
    'Mid level',
    'Senior level',
    'Manager',
    'Executive'
  )),
  industry text,
  -- Optional: only filled in if the participant wants to be contacted about
  -- future studies.
  future_email text,
  created_at timestamptz not null default now()
);

alter table demographics enable row level security;

-- 0004/0005 already hit this gap once (see 0005_grant_specific_meeting.sql):
-- default privileges don't retroactively apply to new tables, so
-- service_role needs an explicit grant here too.
grant select, insert, update, delete on demographics to service_role;
