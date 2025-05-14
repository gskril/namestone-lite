
DROP TABLE IF EXISTS domain;
DROP TABLE IF EXISTS subdomain;
DROP TABLE IF EXISTS api_key;

CREATE TABLE IF NOT EXISTS domain (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	network INT NOT NULL,
	name TEXT NOT NULL,
	address TEXT,
	contenthash TEXT,
	text_records TEXT NOT NULL DEFAULT '[]', -- Stringified JSON
	coin_types TEXT NOT NULL DEFAULT '[]', -- Stringified JSON
	name_limit INT NOT NULL DEFAULT 10000,
	admin TEXT NOT NULL DEFAULT '[]', -- Stringified JSON
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP
);

-- Create a constraint where the (name, network) is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_domain_name_network ON domain (name, network);

CREATE TABLE IF NOT EXISTS subdomain (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	domain_id INTEGER NOT NULL REFERENCES domain(id),
	name TEXT NOT NULL,
	address TEXT,
	contenthash TEXT,
	text_records TEXT NOT NULL DEFAULT '[]', -- Stringified JSON
	coin_types TEXT NOT NULL DEFAULT '[]', -- Stringified JSON
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_key (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	domain_id INTEGER NOT NULL REFERENCES domain(id),
	key TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP
);

