import { useState, useEffect } from 'react';
import { getDecks, createDeck, deleteDeck } from './api';
import './DeckList.css';

export default function DeckList({ onSelectDeck }) {
  const [decks, setDecks] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => { getDecks().then(setDecks); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const deck = await createDeck(newName.trim());
    setDecks(prev => [deck, ...prev]);
    setNewName('');
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this deck? This cannot be undone.')) return;
    await deleteDeck(id);
    setDecks(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="decklist">
      <header className="decklist__header">
        <h1 className="decklist__title">Flash<br />Cards</h1>
        <p className="decklist__sub">Your decks</p>
      </header>

      <div className="decklist__form">
        <input
          className="decklist__input"
          placeholder="New deck name..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <button className="decklist__add-btn" onClick={handleCreate}>+</button>
      </div>

      <div className="decklist__grid">
        {decks.map((deck, i) => (
          <div key={deck.id} className="deck-card" onClick={() => onSelectDeck(deck)}>
            <span className="deck-card__num">0{i + 1}</span>
            <h2 className="deck-card__name">{deck.name}</h2>
            <button className="deck-card__delete" onClick={e => handleDelete(e, deck.id)}>✕</button>
          </div>
        ))}
        {decks.length === 0 && (
          <p className="decklist__empty">No decks yet — create one above!</p>
        )}
      </div>
    </div>
  );
}