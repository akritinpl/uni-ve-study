-- Persist the overall agreement percentage shown on RevealAgreementScreen
-- (share of the 10 suggestions where the consultant's rating matched the
-- participant's own rating) for each consultant, rather than recomputing it
-- from c_res_* on demand.

alter table task
  add column c_agreement_pct_taylor_chen smallint check (c_agreement_pct_taylor_chen between 0 and 100),
  add column c_agreement_pct_morgan_rivera smallint check (c_agreement_pct_morgan_rivera between 0 and 100);
