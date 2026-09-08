-- DemographicsSurvey.tsx no longer asks for years at current job,
-- professional level, or industry — drop the now-unused columns to match.

alter table demographics drop column if exists years_at_job;
alter table demographics drop column if exists professional_level;
alter table demographics drop column if exists industry;
