const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ── Decks ──────────────────────────────────────────────
app.get('/decks', (req, res) => {
  const decks = db.prepare('SELECT * FROM decks ORDER BY created_at DESC').all();
  res.json(decks);
});

app.post('/decks', (req, res) => {
  const { name } = req.body;
  const result = db.prepare('INSERT INTO decks (name) VALUES (?)').run(name);
  res.json({ id: result.lastInsertRowid, name });
});

app.delete('/decks/:id', (req, res) => {
  db.prepare('DELETE FROM decks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Cards ──────────────────────────────────────────────
app.get('/cards/:deckId', (req, res) => {
  const cards = db.prepare('SELECT * FROM cards WHERE deck_id = ?').all(req.params.deckId);
  res.json(cards);
});

app.post('/cards', (req, res) => {
  const { deck_id, front, back } = req.body;
  const result = db.prepare(
    'INSERT INTO cards (deck_id, front, back) VALUES (?, ?, ?)'
  ).run(deck_id, front, back);
  res.json({ id: result.lastInsertRowid, deck_id, front, back });
});

app.delete('/cards/:id', (req, res) => {
  db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── Study ──────────────────────────────────────────────
app.get('/study/:deckId', (req, res) => {
  const cards = db.prepare('SELECT * FROM cards WHERE deck_id = ?').all(req.params.deckId);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  res.json(cards);
});

// ── Production frontend ────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));