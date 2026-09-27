-- Lock down profile score columns properly.
--
-- The prior migration REVOKEd column-level UPDATE, but the `authenticated`
-- role already had a table-wide UPDATE grant, and Postgres does not treat
-- a column-level revoke as a downgrade of a broader grant. Result: users
-- could still PATCH their own xp and streak columns.
--
-- Correct pattern: revoke UPDATE entirely, then grant UPDATE back only on
-- the columns clients are allowed to write.
revoke update on public.profiles from authenticated;

grant update (name, avatar_url, email)
  on public.profiles to authenticated;
