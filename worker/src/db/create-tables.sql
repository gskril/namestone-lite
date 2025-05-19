DROP TABLE IF EXISTS subdomain;
DROP TABLE IF EXISTS api_key;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS domain;
DROP TABLE IF EXISTS siwe;

CREATE TABLE IF NOT EXISTS domain (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	network INT NOT NULL,
	email TEXT,
	name TEXT NOT NULL,
	address TEXT,
	contenthash TEXT,
	text_records TEXT NOT NULL DEFAULT '{}', -- Stringified JSON
	coin_types TEXT NOT NULL DEFAULT '{}', -- Stringified JSON
	name_limit INT NOT NULL DEFAULT 10000,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP
);

-- Create a constraint where the (name, network) is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_domain_name_network ON domain (name, network);

CREATE TABLE IF NOT EXISTS admin (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	domain_id INTEGER NOT NULL REFERENCES domain(id),
	address TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP
);

-- Create a constraint where the (domain_id, address) is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_domain_id_address ON admin (domain_id, address);

CREATE TABLE IF NOT EXISTS subdomain (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	domain_id INTEGER NOT NULL REFERENCES domain(id),
	name TEXT NOT NULL,
	address TEXT,
	contenthash TEXT,
	text_records TEXT NOT NULL DEFAULT '{}', -- Stringified JSON
	coin_types TEXT NOT NULL DEFAULT '{}', -- Stringified JSON
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP
);

-- Create a constraint where the (name, domain_id) is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_subdomain_name_domain_id ON subdomain (name, domain_id);

CREATE TABLE IF NOT EXISTS api_key (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	domain_id INTEGER NOT NULL REFERENCES domain(id),
	key TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS siwe (
	address TEXT PRIMARY KEY,
	message TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

