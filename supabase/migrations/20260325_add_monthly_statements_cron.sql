-- =============================================================
-- Add Supabase pg_cron job for Monthly Statements
-- Runs at 12:00 AM Philippine Time (16:00 UTC), and only
-- triggers statement sending on the month's last day.
-- =============================================================

-- Remove existing job if re-running migration manually
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'monthly-statements';

-- Schedule monthly statements trigger at 12:00 AM PHT.
-- Cron is in UTC, so 12:00 AM PHT = 16:00 UTC (previous day).
-- We use 28-31 with a last-day guard to avoid invalid day-of-month issues.
SELECT cron.schedule(
    'monthly-statements',
    '0 16 28-31 * *',
    $$
    WITH ph AS (
      SELECT (now() AT TIME ZONE 'Asia/Manila')::date AS today
    )
    SELECT CASE
      WHEN today = (date_trunc('month', today)::date + INTERVAL '1 month - 1 day')::date
      THEN net.http_post(
        url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'site_url') || '/api/admin/send-monthly-statements',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret')
        ),
        body := '{"source":"pg_cron"}'::jsonb,
        timeout_milliseconds := 55000
      )
      ELSE NULL
    END
    FROM ph;
    $$
);

-- Verify job registration
SELECT jobid, jobname, schedule
FROM cron.job
WHERE jobname = 'monthly-statements';
