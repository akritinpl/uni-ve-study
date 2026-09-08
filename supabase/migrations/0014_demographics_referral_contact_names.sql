-- Referral contacts now also collect the contact's name alongside their
-- email address.

alter table demographics add column if not exists contact_1_name text;
alter table demographics add column if not exists contact_2_name text;
alter table demographics add column if not exists contact_3_name text;
