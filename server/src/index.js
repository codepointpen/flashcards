const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({ message: 'Flashcard server is alive!' });
});

app.get('/test-db', (req, res) => {
  db.prepare(`INSERT INTO decks (name) VALUES (?)`).run('My First Deck');
  const decks = db.prepare(`SELECT * FROM decks`).all();
  res.json(decks);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));