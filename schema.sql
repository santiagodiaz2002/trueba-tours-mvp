CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  tour TEXT NOT NULL,
  date TEXT NOT NULL,
  people INTEGER NOT NULL CHECK (people >= 1),
  language TEXT NOT NULL,
  pickup TEXT NOT NULL DEFAULT '',
  comments TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
  ON bookings (created_at DESC);

CREATE TABLE IF NOT EXISTS providers (
  id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  role TEXT NOT NULL,
  languages TEXT NOT NULL DEFAULT '',
  experience TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_providers_created_at
  ON providers (created_at DESC);
