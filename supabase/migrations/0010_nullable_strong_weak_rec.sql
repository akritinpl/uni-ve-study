-- A participant who agrees (or disagrees) with all 10 statements has no
-- genuine "weakest" (or "strongest") pick to make — the strong/weak-pick UI
-- step is skipped entirely in that case (see TaskSurvey.tsx). Previously the
-- app padded these columns with arbitrary placeholder rec_ids to satisfy the
-- not-null + length-2 constraints, which is indistinguishable from a real
-- pick downstream. Allow null instead so "no genuine pick was made" is
-- represented honestly. The length-2 check constraint still applies
-- whenever a value is present (Postgres check constraints pass
-- automatically on null).

alter table task
  alter column p_strong_rec drop not null,
  alter column p_weak_rec drop not null;
