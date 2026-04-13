const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../flashcards.db'));
db.pragma('journal_mode = WAL');
db.pragma('wal_checkpoint(TRUNCATE)');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables found:', tables);

if (tables.length > 0) {
  const cards = db.prepare('SELECT * FROM cards').all();
  console.log('Total cards recovered:', cards.length);
  console.log(JSON.stringify(cards, null, 2));
}