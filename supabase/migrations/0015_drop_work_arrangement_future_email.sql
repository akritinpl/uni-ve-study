-- DemographicsSurvey.tsx no longer asks for primary work arrangement or the
-- future-studies email opt-in -- drop the now-unused columns to match.

alter table demographics drop column if exists work_arrangement;
alter table demographics drop column if exists future_email;
