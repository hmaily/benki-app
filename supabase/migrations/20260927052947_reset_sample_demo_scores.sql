-- Data fix: restore the sample@benki.dev demo account to a sane state.
-- Its XP and current_streak were bumped to test values while verifying the
-- pre-lockdown spoofing hole; now that the score columns are trigger-only,
-- clients can no longer patch them, so reset them here as the migration
-- owner (which is not affected by the REVOKE).
update public.profiles
set xp = 1480,
    current_streak = 0,
    longest_streak = 0,
    last_completion_date = null
where email = 'sample@benki.dev';
