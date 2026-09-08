-- A consultant's flipped ratings can end up with fewer than 2 recIds of a
-- given endorse/decline value (e.g. a near-unanimous participant paired
-- with a small flip count), leaving no genuine top 2 / bottom 2 for that
-- consultant to report. Same reasoning as 0010_nullable_strong_weak_rec.sql
-- for the participant's own pick: allow null instead of fabricating a pick,
-- so "this consultant has no genuine strong/weak pick" is represented
-- honestly rather than indistinguishably from a real one. The length-2
-- check constraint still applies whenever a value is present.

alter table task
  alter column c_strong_rec_taylor_chen drop not null,
  alter column c_strong_rec_morgan_rivera drop not null,
  alter column c_weak_rec_taylor_chen drop not null,
  alter column c_weak_rec_morgan_rivera drop not null;
