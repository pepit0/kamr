ALTER TABLE events ADD COLUMN start_at TEXT;

UPDATE events SET start_at = created_at WHERE start_at IS NULL;
