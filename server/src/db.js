const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../flashcards.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS decks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cards (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id    INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    front      TEXT NOT NULL,
    back       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id       INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    confidence    INTEGER NOT NULL CHECK(confidence BETWEEN 1 AND 5),
    ease_factor   REAL DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    due_date      DATE NOT NULL,
    reviewed_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;