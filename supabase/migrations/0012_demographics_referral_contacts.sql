-- Demographics now also collects up to three referral contacts: working
-- professionals the participant knows who may be recruited into a follow-up
-- study. Optional, like future_email.

alter table demographics add column if not exists contact_1_email text;
alter table demographics add column if not exists contact_2_email text;
alter table demographics add column if not exists contact_3_email text;
