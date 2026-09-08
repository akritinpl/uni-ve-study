-- 0004 created specific_meeting with RLS enabled and no policies, same as
-- every other table in this project — but unlike those, it never picked up
-- the project's default privilege grants, so service_role (used by all API
-- routes; it bypasses RLS but still needs the underlying table grants) got
-- "permission denied for table specific_meeting". Grant explicitly instead
-- of relying on default privileges applying retroactively.

grant select, insert, update, delete on specific_meeting to service_role;
