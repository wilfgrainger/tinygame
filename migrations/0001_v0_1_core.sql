PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT,
  created_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS player_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  schema_version INTEGER NOT NULL DEFAULT 1 CHECK(schema_version = 1),
  player_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_spawn_id TEXT NOT NULL DEFAULT 'village-square' CHECK(last_spawn_id IN ('village-square','home-lane','harbour'))
);

CREATE TABLE IF NOT EXISTS player_discoveries (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  discovery_id TEXT NOT NULL CHECK(discovery_id IN ('mountain-summit','woodland-grove','harbour-lookout')),
  discovered_at TEXT NOT NULL,
  PRIMARY KEY (user_id, discovery_id)
);

CREATE TABLE IF NOT EXISTS player_home_state (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  lamp_on INTEGER NOT NULL DEFAULT 0 CHECK(lamp_on IN (0,1)),
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  rate_key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  attempts INTEGER NOT NULL CHECK(attempts >= 0)
);
