const BASE = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const getDecks = () => fetch(`${BASE}/decks`).then(r => r.json());
export const createDeck = (name) => fetch(`${BASE}/decks`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name })
}).then(r => r.json());
export const deleteDeck = (id) => fetch(`${BASE}/decks/${id}`, { method: 'DELETE' }).then(r => r.json());

export const getCards = (deckId) => fetch(`${BASE}/cards/${deckId}`).then(r => r.json());
export const createCard = (deck_id, front, back) => fetch(`${BASE}/cards`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ deck_id, front, back })
}).then(r => r.json());
export const deleteCard = (id) => fetch(`${BASE}/cards/${id}`, { method: 'DELETE' }).then(r => r.json());

export const getStudyCards = (deckId) => fetch(`${BASE}/study/${deckId}`).then(r => r.json());
export const submitReview = (card_id, confidence) => fetch(`${BASE}/review`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ card_id, confidence })
}).then(r => r.json());