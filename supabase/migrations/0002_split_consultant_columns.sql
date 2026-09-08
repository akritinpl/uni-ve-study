-- Split each consultant-keyed JSONB column on `task` into one column per
-- consultant, named by the consultant's snake_cased name. Consultant names
-- are a fixed set of 3 (see lib/consultants.ts), so this is stable.

alter table task
  add column c_res_taylor_chen jsonb,
  add column c_res_morgan_rivera jsonb,
  add column c_res_jordan_patel jsonb,
  add column c_strong_rec_taylor_chen smallint[],
  add column c_strong_rec_morgan_rivera smallint[],
  add column c_strong_rec_jordan_patel smallint[],
  add column c_weak_rec_taylor_chen smallint[],
  add column c_weak_rec_morgan_rivera smallint[],
  add column c_weak_rec_jordan_patel smallint[],
  add column time_c_taylor_chen smallint,
  add column time_c_morgan_rivera smallint,
  add column time_c_jordan_patel smallint;

update task set
  c_res_taylor_chen = c_res -> 'Taylor Chen',
  c_res_morgan_rivera = c_res -> 'Morgan Rivera',
  c_res_jordan_patel = c_res -> 'Jordan Patel',
  c_strong_rec_taylor_chen = array(select jsonb_array_elements_text(c_strong_rec -> 'Taylor Chen'))::smallint[],
  c_strong_rec_morgan_rivera = array(select jsonb_array_elements_text(c_strong_rec -> 'Morgan Rivera'))::smallint[],
  c_strong_rec_jordan_patel = array(select jsonb_array_elements_text(c_strong_rec -> 'Jordan Patel'))::smallint[],
  c_weak_rec_taylor_chen = array(select jsonb_array_elements_text(c_weak_rec -> 'Taylor Chen'))::smallint[],
  c_weak_rec_morgan_rivera = array(select jsonb_array_elements_text(c_weak_rec -> 'Morgan Rivera'))::smallint[],
  c_weak_rec_jordan_patel = array(select jsonb_array_elements_text(c_weak_rec -> 'Jordan Patel'))::smallint[],
  time_c_taylor_chen = (time_c ->> 'Taylor Chen')::smallint,
  time_c_morgan_rivera = (time_c ->> 'Morgan Rivera')::smallint,
  time_c_jordan_patel = (time_c ->> 'Jordan Patel')::smallint;

alter table task
  alter column c_res_taylor_chen set not null,
  alter column c_res_morgan_rivera set not null,
  alter column c_res_jordan_patel set not null,
  alter column c_strong_rec_taylor_chen set not null,
  alter column c_strong_rec_morgan_rivera set not null,
  alter column c_strong_rec_jordan_patel set not null,
  alter column c_weak_rec_taylor_chen set not null,
  alter column c_weak_rec_morgan_rivera set not null,
  alter column c_weak_rec_jordan_patel set not null,
  add constraint c_strong_rec_taylor_chen_len check (array_length(c_strong_rec_taylor_chen, 1) = 2),
  add constraint c_strong_rec_morgan_rivera_len check (array_length(c_strong_rec_morgan_rivera, 1) = 2),
  add constraint c_strong_rec_jordan_patel_len check (array_length(c_strong_rec_jordan_patel, 1) = 2),
  add constraint c_weak_rec_taylor_chen_len check (array_length(c_weak_rec_taylor_chen, 1) = 2),
  add constraint c_weak_rec_morgan_rivera_len check (array_length(c_weak_rec_morgan_rivera, 1) = 2),
  add constraint c_weak_rec_jordan_patel_len check (array_length(c_weak_rec_jordan_patel, 1) = 2),
  drop column c_res,
  drop column c_strong_rec,
  drop column c_weak_rec,
  drop column time_c;
