const { app } = require("electron");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

let db = null;

function getDb() {
  if (db) return db;

  const userDataPath = app.getPath("userData");
  if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });

  const dbPath = path.join(userDataPath, "finance.db");
  db = new Database(dbPath);

  // Segurança/consistência básica
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Schema (snapshot mensal em JSON)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS months (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
      data_json TEXT NOT NULL, -- JSON em texto
      copied_from TEXT,        -- ex: "2025-11"
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, year, month)
    );

    CREATE INDEX IF NOT EXISTS idx_months_user_year_month
      ON months(user_id, year, month);
  `);

  // "Usuário local" padrão (single-user offline)
  const defaultUser = db
    .prepare("SELECT id FROM users WHERE id = 1")
    .get();

  if (!defaultUser) {
    db.prepare("INSERT INTO users (id, name) VALUES (1, ?)").run("Local User");
  }

  return db;
}

/**
 * Helpers
 */
function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function defaultMonthData({ year, month }) {
  return {
    month: monthKey(year, month),
    assets: [],
    statement: [],
    totals: { netWorth: 0 },
    meta: {
      copiedFrom: null,
      notes: ""
    }
  };
}

module.exports = { getDb, monthKey, defaultMonthData };
