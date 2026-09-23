CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  goal TEXT,
  monetized INTEGER NOT NULL DEFAULT 0,
  api_status TEXT NOT NULL DEFAULT 'not_connected',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TEXT,
  posted_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_id TEXT,
  trigger_type TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1,
  last_run_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS finance_records (
  id TEXT PRIMARY KEY,
  account_id TEXT,
  record_date TEXT NOT NULL,
  revenue REAL NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  category TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS affiliate_orders (
  id TEXT PRIMARY KEY,
  account_id TEXT,
  product TEXT NOT NULL,
  commission REAL NOT NULL DEFAULT 0,
  order_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  engagement_rate REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  account_id TEXT,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'other',
  url TEXT,
  tags TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL DEFAULT 'mai',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  detail TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
