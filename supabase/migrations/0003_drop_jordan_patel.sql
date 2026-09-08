-- The study now uses 2 consultants instead of 3 (see lib/consultants.ts):
-- one that agrees with the participant ~90-100% of the time, and one that
-- agrees only ~10-40% of the time. Drop Jordan Patel's dedicated columns.

alter table task
  drop column c_res_jordan_patel,
  drop column c_strong_rec_jordan_patel,
  drop column c_weak_rec_jordan_patel,
  drop column time_c_jordan_patel;
