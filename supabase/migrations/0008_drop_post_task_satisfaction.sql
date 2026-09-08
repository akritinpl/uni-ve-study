-- satisfaction ("what works well?") was intentionally replaced by
-- would_change during the "Final survey additions" redesign (see
-- PostTaskSurvey.tsx history) but the column was never dropped. No UI field
-- has written to it since, so it's dead.

alter table post_task_vm drop column if exists satisfaction;
