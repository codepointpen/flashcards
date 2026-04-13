import { useState, useEffect } from 'react';
import { getCards, createCard, deleteCard } from './api';
import './CardEditor.css';

export default function CardEditor({ deck, onBack, onStudy }) {
  const [cards, setCards] = useState([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  useEffect(() => { getCards(deck.id).then(setCards); }, [deck.id]);

  const handleAdd = async () => {
    if (!front.trim() || !back.trim()) return;
    const card = await createCard(deck.id, front.trim(), back.trim());
    setCards(prev => [...prev, card]);
    setFront('');
    setBack('');
  };

  const handleDelete = async (id) => {
    await deleteCard(id);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="editor">
      <div className="editor__topbar">
        <button className="editor__back" onClick={onBack}>← All decks</button>
        {cards.length > 0 && (
          <button className="editor__study-btn" onClick={onStudy}>Study now →</button>
        )}
      </div>

      <h1 className="editor__title">{deck.name}</h1>
      <p className="editor__count">{cards.length} card{cards.length !== 1 ? 's' : ''}</p>

      <div className="editor__form">
        <textarea
          className="editor__textarea"
          placeholder="Front of card..."
          value={front}
          onChange={e => setFront(e.target.value)}
          rows={3}
        />
        <textarea
          className="editor__textarea"
          placeholder="Back of card..."
          value={back}
          onChange={e => setBack(e.target.value)}
          rows={3}
        />
        <button className="editor__add-btn" onClick={handleAdd}>Add card</button>
      </div>

      <div className="editor__list">
        {cards.map((card, i) => (
          <div key={card.id} className="editor__card">
            <span className="editor__card-num">0{i + 1}</span>
            <div className="editor__card-content">
              <p className="editor__card-front">{card.front}</p>
              <p className="editor__card-back">{card.back}</p>
            </div>
            <button className="editor__card-delete" onClick={() => handleDelete(card.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}