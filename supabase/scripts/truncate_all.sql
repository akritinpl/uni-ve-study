-- Deletes all rows from every application table and resets identity sequences.
-- Run in the Supabase SQL editor, or: supabase db execute -f supabase/scripts/truncate_all.sql

truncate table
  irb_consent,
  pre_task,
  survey_rec,
  task,
  post_task_vm,
  specific_meeting,
  demographics
restart identity cascade;
