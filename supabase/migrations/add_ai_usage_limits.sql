-- Add columns for AI feature usage tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS daily_outfit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_menu_count INTEGER DEFAULT 0;

-- Function to reset daily counts (update existing reset logic)
-- Note: This assumes you handle resets in your application logic (route.ts) as seen in previous code.
-- If you have a cron or database trigger for resets, update it here.
-- For now, the application logic in /api/decide and the new APIs handles the reset based on 'last_reset_date'.

-- To verify it works, run:
-- SELECT * FROM users;
