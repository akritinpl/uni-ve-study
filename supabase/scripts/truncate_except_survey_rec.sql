-- Deletes all recorded participant data, preserving survey_rec (static seed data).
-- Run in the Supabase SQL editor, or: supabase db execute -f supabase/scripts/truncate_except_survey_rec.sql

truncate table
  irb_consent,
  pre_task,
  task,
  post_task_vm,
  specific_meeting,
  demographics
restart identity cascade;
