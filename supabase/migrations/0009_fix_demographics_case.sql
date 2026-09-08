-- The demographics check constraints from 0007 were written in lowercase,
-- but DemographicsSurvey.tsx has always sent the capitalized display
-- strings (e.g. "Male", "Some college", "Fully remote") straight through —
-- so every insert has been failing the check constraint since launch.
-- Relax the constraints to match what the UI actually sends instead of
-- changing the UI's stored values.

alter table demographics drop constraint if exists demographics_sex_check;
alter table demographics add constraint demographics_sex_check
  check (sex in ('Male', 'Female'));

alter table demographics drop constraint if exists demographics_education_check;
alter table demographics add constraint demographics_education_check
  check (education in (
    'Less than high school',
    'High school graduate',
    'Some college',
    '2 year degree',
    '4 year degree',
    'Professional degree',
    'Doctorate'
  ));

alter table demographics drop constraint if exists demographics_work_arrangement_check;
alter table demographics add constraint demographics_work_arrangement_check
  check (work_arrangement in ('Fully remote', 'Fully on-site/in-office', 'Hybrid'));
