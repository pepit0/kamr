-- Retention policy + media metadata
ALTER TABLE events ADD COLUMN retention_days INTEGER NOT NULL DEFAULT 30;

ALTER TABLE photos ADD COLUMN media_type TEXT NOT NULL DEFAULT 'photo';
ALTER TABLE photos ADD COLUMN duration_ms INTEGER;
ALTER TABLE photos ADD COLUMN thumbnail_r2_key TEXT;
ALTER TABLE photos ADD COLUMN file_size_bytes INTEGER;
ALTER TABLE photos ADD COLUMN original_filename TEXT;
