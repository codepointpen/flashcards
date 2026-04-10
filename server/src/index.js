const express = require('express');
const cors = require('cors');
const db = require('./db');
const sm2 = require('./sm2');

const app = express();
app.use(cors());
app.use(express.json());

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

app.get('/study/:deckId', (req, res) => {
  const cards = db.prepare(`
    SELECT c.*, r.ease_factor, r.interval_days, r.due_date
    FROM cards c
    LEFT JOIN (
      SELECT card_id, ease_factor, interval_days, due_date
      FROM reviews
      WHERE id IN (SELECT MAX(id) FROM reviews GROUP BY card_id)
    ) r ON c.id = r.card_id
    WHERE c.deck_id = ?
      AND (r.due_date IS NULL OR r.due_date <= date('now'))
    ORDER BY r.due_date ASC NULLS FIRST
  `).all(req.params.deckId);
  res.json(cards);
});

app.post('/review', (req, res) => {
  const { card_id, confidence } = req.body;
  const { ease_factor, interval_days, due_date } = sm2(confidence, card_id, db);
  db.prepare(
    'INSERT INTO reviews (card_id, confidence, ease_factor, interval_days, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(card_id, confidence, ease_factor, interval_days, due_date);
  res.json({ ease_factor, interval_days, due_date });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));